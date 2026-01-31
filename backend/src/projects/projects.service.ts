import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    // Ensure user exists in our database (handles webhook race condition)
    await this.authService.ensureUserExists(userId);

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        baseUrl: dto.baseUrl,
        userId,
      },
      include: {
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        testFiles: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { steps: true, testRuns: true },
            },
          },
        },
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }
}
