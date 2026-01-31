import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, userId: string, dto: CreateFolderDto) {
    // First verify user owns the project
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return null;
    }

    return this.prisma.folder.create({
      data: {
        name: dto.name,
        projectId,
      },
      include: {
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    // First verify user owns the project
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return null;
    }

    return this.prisma.folder.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
        _count: {
          select: { testFiles: true },
        },
      },
    });

    if (!folder || folder.project.userId !== userId) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { project, ...folderWithoutProject } = folder;
    return folderWithoutProject;
  }

  async update(id: string, userId: string, dto: UpdateFolderDto) {
    // First verify ownership through project
    const folder = await this.prisma.folder.findFirst({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!folder || folder.project.userId !== userId) {
      return null;
    }

    return this.prisma.folder.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
      },
      include: {
        _count: {
          select: { testFiles: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    // First verify ownership through project
    const folder = await this.prisma.folder.findFirst({
      where: { id },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!folder || folder.project.userId !== userId) {
      return null;
    }

    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    return this.prisma.folder.delete({
      where: { id },
    });
  }
}
