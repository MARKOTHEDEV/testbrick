import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestFileDto } from './dto/create-test-file.dto';
import { UpdateTestFileDto } from './dto/update-test-file.dto';
import { CreateStepDto } from './dto/create-step.dto';

@Injectable()
export class TestFilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verify user owns the folder through project ownership
   */
  private async verifyFolderOwnership(
    folderId: string,
    userId: string,
  ): Promise<boolean> {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId },
      include: { project: { select: { userId: true } } },
    });
    return folder?.project.userId === userId;
  }

  /**
   * Verify user owns the test file through folder -> project ownership
   */
  private async verifyTestFileOwnership(
    testFileId: string,
    userId: string,
  ): Promise<boolean> {
    const testFile = await this.prisma.testFile.findFirst({
      where: { id: testFileId },
      include: {
        folder: {
          include: { project: { select: { userId: true } } },
        },
      },
    });
    return testFile?.folder.project.userId === userId;
  }

  /**
   * Create a new test file in a folder
   */
  async create(folderId: string, userId: string, dto: CreateTestFileDto) {
    const hasAccess = await this.verifyFolderOwnership(folderId, userId);
    if (!hasAccess) {
      return null;
    }

    return this.prisma.testFile.create({
      data: {
        name: dto.name,
        description: dto.description,
        folderId,
      },
      include: {
        _count: {
          select: {
            steps: true,
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Get all test files in a folder
   */
  async findAllByFolder(folderId: string, userId: string) {
    const hasAccess = await this.verifyFolderOwnership(folderId, userId);
    if (!hasAccess) {
      return null;
    }

    return this.prisma.testFile.findMany({
      where: { folderId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: {
            steps: true,
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Get a single test file with all details
   */
  async findOne(id: string, userId: string) {
    const hasAccess = await this.verifyTestFileOwnership(id, userId);
    if (!hasAccess) {
      return null;
    }

    const testFile = await this.prisma.testFile.findFirst({
      where: { id },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        testRuns: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Only return recent runs
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            steps: true,
            testRuns: true,
          },
        },
      },
    });

    return testFile;
  }

  /**
   * Update a test file
   */
  async update(id: string, userId: string, dto: UpdateTestFileDto) {
    const hasAccess = await this.verifyTestFileOwnership(id, userId);
    if (!hasAccess) {
      return null;
    }

    return this.prisma.testFile.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: {
        _count: {
          select: {
            steps: true,
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Delete a test file (cascades to steps and runs)
   */
  async delete(id: string, userId: string) {
    const hasAccess = await this.verifyTestFileOwnership(id, userId);
    if (!hasAccess) {
      return null;
    }

    return this.prisma.testFile.delete({
      where: { id },
    });
  }

  /**
   * Create a new step for a test file
   * Auto-increments stepNumber based on existing steps
   */
  async createStep(testFileId: string, userId: string, dto: CreateStepDto) {
    const hasAccess = await this.verifyTestFileOwnership(testFileId, userId);
    if (!hasAccess) {
      return null;
    }

    // Get the current max stepNumber
    const maxStep = await this.prisma.testStep.findFirst({
      where: { testFileId },
      orderBy: { stepNumber: 'desc' },
      select: { stepNumber: true },
    });

    const nextStepNumber = (maxStep?.stepNumber ?? 0) + 1;

    // Build the locators JSON, including qaId if provided
    const locators = {
      ...dto.locators,
      ...(dto.qaId && { qaId: dto.qaId }),
    };

    // Build description with more context if needed
    let description = dto.description;
    if (dto.assertionType && dto.action === 'assert') {
      description = `Assert ${dto.assertionType.replace(/_/g, ' ')}${dto.value ? `: "${dto.value}"` : ''}`;
    }

    return this.prisma.testStep.create({
      data: {
        testFileId,
        stepNumber: nextStepNumber,
        action: dto.action,
        description,
        value: dto.value,
        locators: Object.keys(locators).length > 0 ? locators : undefined,
        elementScreenshot: dto.elementScreenshot,
      },
    });
  }

  /**
   * Get all steps for a test file
   */
  async findStepsByTestFile(testFileId: string, userId: string) {
    const hasAccess = await this.verifyTestFileOwnership(testFileId, userId);
    if (!hasAccess) {
      return null;
    }

    return this.prisma.testStep.findMany({
      where: { testFileId },
      orderBy: { stepNumber: 'asc' },
    });
  }

  /**
   * Delete a step (reorders remaining steps)
   */
  async deleteStep(stepId: string, userId: string) {
    // First get the step to verify ownership and get testFileId
    const step = await this.prisma.testStep.findFirst({
      where: { id: stepId },
      include: {
        testFile: {
          include: {
            folder: {
              include: { project: { select: { userId: true } } },
            },
          },
        },
      },
    });

    if (!step || step.testFile.folder.project.userId !== userId) {
      return null;
    }

    // Delete the step
    await this.prisma.testStep.delete({
      where: { id: stepId },
    });

    // Reorder remaining steps
    const remainingSteps = await this.prisma.testStep.findMany({
      where: { testFileId: step.testFileId },
      orderBy: { stepNumber: 'asc' },
    });

    // Update step numbers
    await Promise.all(
      remainingSteps.map((s, index) =>
        this.prisma.testStep.update({
          where: { id: s.id },
          data: { stepNumber: index + 1 },
        }),
      ),
    );

    return step;
  }
}
