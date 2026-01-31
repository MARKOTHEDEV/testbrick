import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlaywrightService, PlaywrightContext } from './playwright.service';
import { StepExecutorService } from './step-executor.service';
import { nanoid } from 'nanoid';
import { Page } from 'playwright';
import { TestRunStatus, StepResultStatus, TestErrorType, Prisma } from '@prisma/client';

interface CapturedError {
  type: TestErrorType;
  message: string;
  url?: string;
  context?: Prisma.InputJsonValue;
}

@Injectable()
export class TestRunsService {
  // Track active test runs for cancellation
  private activeRuns: Map<string, { cancelled: boolean }> = new Map();

  constructor(
    private prisma: PrismaService,
    private playwrightService: PlaywrightService,
    private stepExecutorService: StepExecutorService,
  ) {}

  /**
   * Start a new test run
   */
  async startRun(testFileId: string, userId: string) {
    // Verify ownership
    await this.verifyTestFileOwnership(testFileId, userId);

    // Get test file with steps
    const testFile = await this.prisma.testFile.findUnique({
      where: { id: testFileId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        folder: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!testFile) {
      throw new NotFoundException('Test file not found');
    }

    if (testFile.steps.length === 0) {
      throw new ForbiddenException('Cannot run test with no steps');
    }

    // Create test run
    const testRun = await this.prisma.testRun.create({
      data: {
        testFileId,
        status: TestRunStatus.PENDING,
        shareToken: nanoid(12),
      },
    });

    // Create step results (all pending initially)
    await this.prisma.stepResult.createMany({
      data: testFile.steps.map((step) => ({
        testRunId: testRun.id,
        testStepId: step.id,
        status: StepResultStatus.PENDING,
      })),
    });

    // Track this run
    this.activeRuns.set(testRun.id, { cancelled: false });

    // Execute test asynchronously (don't await)
    this.executeTest(testRun.id, testFile, testFile.folder.project.baseUrl);

    // Return the run immediately (client will poll for status)
    return this.findOne(testRun.id, userId);
  }

  /**
   * Execute test steps (called asynchronously)
   */
  private async executeTest(
    testRunId: string,
    testFile: {
      steps: Array<{
        id: string;
        stepNumber: number;
        action: string;
        description: string;
        value: string | null;
        locators: unknown;
      }>;
    },
    baseUrl: string,
  ) {
    let context: PlaywrightContext | null = null;
    const capturedErrors: CapturedError[] = [];

    try {
      // Update status to running
      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: TestRunStatus.RUNNING,
          startedAt: new Date(),
        },
      });

      // Create browser context
      context = await this.playwrightService.createContext();
      const { page, browser } = context;

      // Setup error listeners
      this.setupErrorListeners(page, capturedErrors);

      // Navigate to base URL first
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      // Execute each step
      let allPassed = true;

      for (const step of testFile.steps) {
        // Check if cancelled
        if (this.activeRuns.get(testRunId)?.cancelled) {
          // Mark remaining steps as skipped
          await this.prisma.stepResult.updateMany({
            where: {
              testRunId,
              status: StepResultStatus.PENDING,
            },
            data: {
              status: StepResultStatus.SKIPPED,
            },
          });
          break;
        }

        // Get the step result record
        const stepResult = await this.prisma.stepResult.findFirst({
          where: {
            testRunId,
            testStepId: step.id,
          },
        });

        if (!stepResult) continue;

        // Update to running
        await this.prisma.stepResult.update({
          where: { id: stepResult.id },
          data: { status: StepResultStatus.RUNNING },
        });

        // Execute the step
        const result = await this.stepExecutorService.execute(page, {
          id: step.id,
          stepNumber: step.stepNumber,
          action: step.action,
          description: step.description,
          value: step.value,
          locators: step.locators as Record<string, unknown> | null,
        });

        // Update step result
        const stepStatus =
          result.status === 'PASSED'
            ? StepResultStatus.PASSED
            : StepResultStatus.FAILED;

        await this.prisma.stepResult.update({
          where: { id: stepResult.id },
          data: {
            status: stepStatus,
            duration: result.duration,
            error: result.error,
            locatorUsed: result.locatorUsed,
            screenshotUrl: result.screenshot
              ? `data:image/png;base64,${result.screenshot}`
              : null,
          },
        });

        if (result.status === 'FAILED') {
          allPassed = false;

          // Capture as test error
          capturedErrors.push({
            type: result.error?.includes('ELEMENT_NOT_FOUND')
              ? TestErrorType.ELEMENT_NOT_FOUND
              : result.error?.includes('timeout')
                ? TestErrorType.TIMEOUT_ERROR
                : result.error?.includes('expect')
                  ? TestErrorType.ASSERTION_ERROR
                  : TestErrorType.OTHER,
            message: result.error || 'Unknown error',
            url: page.url(),
          });

          // Continue executing remaining steps (don't stop on first failure)
        }
      }

      // Check final status
      const runState = this.activeRuns.get(testRunId);
      const finalStatus = runState?.cancelled
        ? TestRunStatus.CANCELLED
        : allPassed
          ? TestRunStatus.PASSED
          : TestRunStatus.FAILED;

      // Save captured errors
      if (capturedErrors.length > 0) {
        for (const err of capturedErrors) {
          await this.prisma.testError.create({
            data: {
              testRunId,
              type: err.type,
              message: err.message,
              url: err.url,
              context: err.context ?? undefined,
            },
          });
        }
      }

      // Update test run status
      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: finalStatus,
          endedAt: new Date(),
        },
      });

      // Cleanup
      await this.playwrightService.close(browser);
    } catch (error) {
      // Handle unexpected errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.prisma.testError.create({
        data: {
          testRunId,
          type: TestErrorType.OTHER,
          message: `Test execution failed: ${errorMessage}`,
        },
      });

      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: TestRunStatus.FAILED,
          endedAt: new Date(),
        },
      });

      // Cleanup browser if it exists
      if (context) {
        await this.playwrightService.close(context.browser);
      }
    } finally {
      // Remove from active runs
      this.activeRuns.delete(testRunId);
    }
  }

  /**
   * Setup error listeners on the page
   */
  private setupErrorListeners(page: Page, capturedErrors: CapturedError[]) {
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        capturedErrors.push({
          type: TestErrorType.CONSOLE_ERROR,
          message: msg.text(),
          url: page.url(),
        });
      }
    });

    // Capture network errors (4xx, 5xx)
    page.on('response', (response) => {
      if (response.status() >= 400) {
        capturedErrors.push({
          type: TestErrorType.NETWORK_ERROR,
          message: `${response.status()} ${response.statusText()}`,
          url: response.url(),
          context: {
            method: response.request().method(),
            status: response.status(),
          } as Prisma.InputJsonValue,
        });
      }
    });
  }

  /**
   * Get a test run by ID
   */
  async findOne(runId: string, userId: string) {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        stepResults: {
          include: {
            testStep: true,
          },
          orderBy: {
            testStep: {
              stepNumber: 'asc',
            },
          },
        },
        errors: {
          orderBy: { timestamp: 'asc' },
        },
        testFile: {
          include: {
            folder: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!testRun) {
      throw new NotFoundException('Test run not found');
    }

    // Verify ownership
    if (testRun.testFile.folder.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatTestRunResponse(testRun);
  }

  /**
   * Get a test run by share token (public access)
   */
  async findByShareToken(shareToken: string) {
    const testRun = await this.prisma.testRun.findUnique({
      where: { shareToken },
      include: {
        stepResults: {
          include: {
            testStep: true,
          },
          orderBy: {
            testStep: {
              stepNumber: 'asc',
            },
          },
        },
        errors: {
          orderBy: { timestamp: 'asc' },
        },
        testFile: true,
      },
    });

    if (!testRun) {
      throw new NotFoundException('Test run not found');
    }

    return this.formatTestRunResponse(testRun);
  }

  /**
   * Cancel a running test
   */
  async cancelRun(runId: string, userId: string) {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testFile: {
          include: {
            folder: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    if (!testRun) {
      throw new NotFoundException('Test run not found');
    }

    // Verify ownership
    if (testRun.testFile.folder.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Mark as cancelled
    const runState = this.activeRuns.get(runId);
    if (runState) {
      runState.cancelled = true;
    }

    // Update status if not already terminal
    if (
      testRun.status === TestRunStatus.PENDING ||
      testRun.status === TestRunStatus.RUNNING
    ) {
      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: TestRunStatus.CANCELLED,
          endedAt: new Date(),
        },
      });
    }

    return { message: 'Test run cancelled' };
  }

  /**
   * Get all runs for a test file
   */
  async findByTestFile(testFileId: string, userId: string) {
    await this.verifyTestFileOwnership(testFileId, userId);

    const runs = await this.prisma.testRun.findMany({
      where: { testFileId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        stepResults: {
          include: {
            testStep: true,
          },
        },
        errors: true,
      },
    });

    return runs.map((run) => this.formatTestRunResponse(run));
  }

  /**
   * Format test run response
   */
  private formatTestRunResponse(testRun: {
    id: string;
    status: TestRunStatus;
    startedAt: Date | null;
    endedAt: Date | null;
    videoUrl: string | null;
    shareToken: string | null;
    createdAt: Date;
    testFileId: string;
    stepResults: Array<{
      id: string;
      status: StepResultStatus;
      duration: number | null;
      error: string | null;
      screenshotUrl: string | null;
      locatorUsed: string | null;
      testStepId: string;
      testStep: {
        id: string;
        stepNumber: number;
        action: string;
        description: string;
      };
    }>;
    errors: Array<{
      id: string;
      type: TestErrorType;
      message: string;
      stack: string | null;
      url: string | null;
      timestamp: Date;
      context: unknown;
    }>;
    testFile?: {
      id: string;
      name: string;
    };
  }) {
    const totalSteps = testRun.stepResults.length;
    const completedSteps = testRun.stepResults.filter(
      (r) =>
        r.status === StepResultStatus.PASSED ||
        r.status === StepResultStatus.FAILED ||
        r.status === StepResultStatus.SKIPPED,
    ).length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return {
      id: testRun.id,
      status: testRun.status,
      startedAt: testRun.startedAt,
      endedAt: testRun.endedAt,
      videoUrl: testRun.videoUrl,
      shareToken: testRun.shareToken,
      createdAt: testRun.createdAt,
      testFileId: testRun.testFileId,
      testFileName: testRun.testFile?.name,
      progress,
      stepResults: testRun.stepResults.map((result) => ({
        id: result.id,
        status: result.status,
        duration: result.duration,
        error: result.error,
        screenshotUrl: result.screenshotUrl,
        locatorUsed: result.locatorUsed,
        testStepId: result.testStepId,
        stepNumber: result.testStep.stepNumber,
        action: result.testStep.action,
        description: result.testStep.description,
      })),
      errors: testRun.errors.map((error) => ({
        id: error.id,
        type: error.type,
        message: error.message,
        stack: error.stack,
        url: error.url,
        timestamp: error.timestamp,
        context: error.context,
      })),
    };
  }

  /**
   * Verify test file ownership
   */
  private async verifyTestFileOwnership(testFileId: string, userId: string) {
    const testFile = await this.prisma.testFile.findUnique({
      where: { id: testFileId },
      include: {
        folder: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!testFile) {
      throw new NotFoundException('Test file not found');
    }

    if (testFile.folder.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return testFile;
  }
}
