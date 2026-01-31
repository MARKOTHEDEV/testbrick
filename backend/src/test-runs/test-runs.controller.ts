import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { TestRunsService } from './test-runs.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('test-runs')
@Controller('test-runs')
export class TestRunsController {
  constructor(private readonly testRunsService: TestRunsService) {}

  @Post('tests/:testId/run')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a new test run' })
  @ApiQuery({
    name: 'headless',
    required: false,
    type: Boolean,
    description: 'Run in headless mode (default: true)',
  })
  @ApiResponse({ status: 201, description: 'Test run started successfully' })
  @ApiResponse({ status: 404, description: 'Test file not found' })
  @ApiResponse({ status: 403, description: 'Cannot run test with no steps' })
  async startRun(
    @Param('testId') testId: string,
    @Query('headless') headless: string | undefined,
    @CurrentUser() auth: AuthPayload,
  ) {
    // Parse headless param - default to true, only false if explicitly 'false'
    const isHeadless = headless !== 'false';
    return this.testRunsService.startRun(testId, auth.userId, isHeadless);
  }

  @Get(':runId')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get test run status and results (for polling)' })
  @ApiResponse({ status: 200, description: 'Returns test run with step results' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  async findOne(
    @Param('runId') runId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    return this.testRunsService.findOne(runId, auth.userId);
  }

  @Post(':runId/cancel')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a running test' })
  @ApiResponse({ status: 200, description: 'Test run cancelled' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  async cancelRun(
    @Param('runId') runId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    return this.testRunsService.cancelRun(runId, auth.userId);
  }

  @Get('tests/:testId/runs')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all runs for a test file' })
  @ApiResponse({ status: 200, description: 'Returns array of test runs' })
  @ApiResponse({ status: 404, description: 'Test file not found' })
  async findByTestFile(
    @Param('testId') testId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    return this.testRunsService.findByTestFile(testId, auth.userId);
  }

  @Get('share/:shareToken')
  @ApiOperation({ summary: 'Get test run by share token (public access)' })
  @ApiResponse({ status: 200, description: 'Returns test run with step results' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  async findByShareToken(@Param('shareToken') shareToken: string) {
    return this.testRunsService.findByShareToken(shareToken);
  }

  @Post('share/:shareToken/verify')
  @ApiOperation({ summary: 'Re-run a test to verify a fix (public access)' })
  @ApiResponse({ status: 201, description: 'New test run started' })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  async verifyFix(@Param('shareToken') shareToken: string) {
    return this.testRunsService.verifyFix(shareToken);
  }
}
