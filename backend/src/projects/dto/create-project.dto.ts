import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name', example: 'My E-commerce Tests' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Project description', example: 'Tests for the checkout flow' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Base URL for the project', example: 'https://example.com' })
  @IsUrl({ require_tld: false }) // Allow localhost URLs
  @IsNotEmpty()
  baseUrl: string;
}
