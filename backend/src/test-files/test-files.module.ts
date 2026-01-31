import { Module } from '@nestjs/common';
import { TestFilesController } from './test-files.controller';
import { TestFilesService } from './test-files.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TestFilesController],
  providers: [TestFilesService],
  exports: [TestFilesService],
})
export class TestFilesModule {}
