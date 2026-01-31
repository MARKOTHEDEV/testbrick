import { Injectable } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private clerk;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

  /**
   * Ensures a user exists in our database.
   * If not, fetches from Clerk and creates them.
   */
  async ensureUserExists(userId: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return;
    }

    // User doesn't exist, fetch from Clerk and create
    try {
      const clerkUser = await this.clerk.users.getUser(userId);

      await this.prisma.user.create({
        data: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });
    } catch (error) {
      // If user already exists (race condition), that's fine
      if ((error as { code?: string })?.code === 'P2002') {
        return;
      }
      throw error;
    }
  }
}
