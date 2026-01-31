import {
  Controller,
  Post,
  Headers,
  HttpException,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthPayload } from './decorators/current-user.decorator';
import type { Request } from 'express';

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Post('webhook/clerk')
  @ApiOperation({ summary: 'Clerk webhook for user sync' })
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    // If no webhook secret, accept events in development (for testing)
    if (!webhookSecret) {
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        // In development without webhook secret, parse body directly
        const body = req.body as ClerkUserEvent;
        return this.processClerkEvent(body);
      }
      throw new HttpException(
        'Webhook secret not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let event: ClerkUserEvent;

    try {
      const rawBody = req.rawBody;
      if (!rawBody) {
        throw new Error('No raw body');
      }
      event = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkUserEvent;
    } catch (err) {
      throw new HttpException('Invalid webhook signature', HttpStatus.BAD_REQUEST);
    }

    return this.processClerkEvent(event);
  }

  private async processClerkEvent(event: ClerkUserEvent) {
    const { type, data } = event;

    switch (type) {
      case 'user.created':
      case 'user.updated':
        await this.prisma.user.upsert({
          where: { id: data.id },
          update: {
            email: data.email_addresses[0]?.email_address ?? '',
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
          create: {
            id: data.id,
            email: data.email_addresses[0]?.email_address ?? '',
            firstName: data.first_name,
            lastName: data.last_name,
            imageUrl: data.image_url,
          },
        });
        break;

      case 'user.deleted':
        await this.prisma.user.delete({
          where: { id: data.id },
        }).catch(() => {
          // User might not exist in our database
        });
        break;
    }

    return { success: true };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getCurrentUser(@CurrentUser() auth: AuthPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found in database', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
