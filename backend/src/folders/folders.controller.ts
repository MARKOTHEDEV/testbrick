import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('folders')
@Controller()
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('projects/:projectId/folders')
  @ApiOperation({ summary: 'Create a new folder in a project' })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() dto: CreateFolderDto,
  ) {
    const folder = await this.foldersService.create(projectId, auth.userId, dto);

    if (!folder) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    return folder;
  }

  @Get('projects/:projectId/folders')
  @ApiOperation({ summary: 'Get all folders in a project' })
  @ApiResponse({ status: 200, description: 'Returns all folders for the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findAllByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const folders = await this.foldersService.findAllByProject(projectId, auth.userId);

    if (folders === null) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    return folders;
  }

  @Get('folders/:id')
  @ApiOperation({ summary: 'Get a folder by ID' })
  @ApiResponse({ status: 200, description: 'Returns the folder' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const folder = await this.foldersService.findOne(id, auth.userId);

    if (!folder) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }

    return folder;
  }

  @Patch('folders/:id')
  @ApiOperation({ summary: 'Update a folder' })
  @ApiResponse({ status: 200, description: 'Folder updated successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() dto: UpdateFolderDto,
  ) {
    const folder = await this.foldersService.update(id, auth.userId, dto);

    if (!folder) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }

    return folder;
  }

  @Delete('folders/:id')
  @ApiOperation({ summary: 'Delete a folder' })
  @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const folder = await this.foldersService.delete(id, auth.userId);

    if (!folder) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Folder deleted successfully' };
  }
}
