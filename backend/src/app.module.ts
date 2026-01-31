import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { FoldersModule } from './folders/folders.module';
import { TestFilesModule } from './test-files/test-files.module';
import { TestRunsModule } from './test-runs/test-runs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    FoldersModule,
    TestFilesModule,
    TestRunsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
