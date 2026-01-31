import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'Project name', example: 'My E-commerce Tests' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Project description', example: 'Tests for the checkout flow' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Base URL for the project', example: 'https://example.com' })
  @IsUrl({ require_tld: false }) // Allow localhost URLs
  @IsOptional()
  baseUrl?: string;
}
