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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TestFilesService } from './test-files.service';
import { CreateTestFileDto } from './dto/create-test-file.dto';
import { UpdateTestFileDto } from './dto/update-test-file.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('test-files')
@Controller()
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class TestFilesController {
  constructor(private readonly testFilesService: TestFilesService) {}

  @Post('folders/:folderId/tests')
  @ApiOperation({ summary: 'Create a new test file in a folder' })
  @ApiResponse({ status: 201, description: 'Test file created successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async create(
    @Param('folderId') folderId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() dto: CreateTestFileDto,
  ) {
    const testFile = await this.testFilesService.create(
      folderId,
      auth.userId,
      dto,
    );
    if (!testFile) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }
    return testFile;
  }

  @Get('folders/:folderId/tests')
  @ApiOperation({ summary: 'Get all test files in a folder' })
  @ApiResponse({ status: 200, description: 'Returns array of test files' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async findAllByFolder(
    @Param('folderId') folderId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const testFiles = await this.testFilesService.findAllByFolder(
      folderId,
      auth.userId,
    );
    if (testFiles === null) {
      throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
    }
    return testFiles;
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get a test file with steps and recent runs' })
  @ApiResponse({ status: 200, description: 'Returns test file with details' })
  @ApiResponse({ status: 404, description: 'Test file not found' })
  async findOne(@Param('id') id: string, @CurrentUser() auth: AuthPayload) {
    const testFile = await this.testFilesService.findOne(id, auth.userId);
    if (!testFile) {
      throw new HttpException('Test file not found', HttpStatus.NOT_FOUND);
    }
    return testFile;
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Update a test file' })
  @ApiResponse({ status: 200, description: 'Test file updated successfully' })
  @ApiResponse({ status: 404, description: 'Test file not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() dto: UpdateTestFileDto,
  ) {
    const testFile = await this.testFilesService.update(id, auth.userId, dto);
    if (!testFile) {
      throw new HttpException('Test file not found', HttpStatus.NOT_FOUND);
    }
    return testFile;
  }

  @Delete('tests/:id')
  @ApiOperation({ summary: 'Delete a test file' })
  @ApiResponse({ status: 200, description: 'Test file deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test file not found' })
  async delete(@Param('id') id: string, @CurrentUser() auth: AuthPayload) {
    const testFile = await this.testFilesService.delete(id, auth.userId);
    if (!testFile) {
      throw new HttpException('Test file not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Test file deleted successfully' };
  }
}
