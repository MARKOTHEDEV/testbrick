import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestFileDto } from './dto/create-test-file.dto';
import { UpdateTestFileDto } from './dto/update-test-file.dto';

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
}
