import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
          select: { folders: true },
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
          select: { folders: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        folders: {
          orderBy: { createdAt: 'desc' },
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
        },
        _count: {
          select: { folders: true },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    // First verify ownership
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return null;
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.baseUrl && { baseUrl: dto.baseUrl }),
      },
      include: {
        _count: {
          select: { folders: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    // First verify ownership
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return null;
    }

    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
