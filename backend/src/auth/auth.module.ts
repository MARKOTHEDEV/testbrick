import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [ClerkAuthGuard, AuthService],
  exports: [ClerkAuthGuard, AuthService],
})
export class AuthModule {}
