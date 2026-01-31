import { Module } from '@nestjs/common';
import { TestRunsController } from './test-runs.controller';
import { TestRunsService } from './test-runs.service';
import { PlaywrightService } from './playwright.service';
import { StepExecutorService } from './step-executor.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TestRunsController],
  providers: [TestRunsService, PlaywrightService, StepExecutorService],
  exports: [TestRunsService],
})
export class TestRunsModule {}
