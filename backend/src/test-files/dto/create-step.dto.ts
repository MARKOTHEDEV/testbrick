import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';

/**
 * LocatorBundle - multiple locator strategies for robust element targeting
 * Priority order during playback: role > testId > label > placeholder > text > css > xpath
 */
export class LocatorBundleDto {
  @ApiPropertyOptional({
    description: 'Role locator (most stable)',
    example: { role: 'button', name: 'Submit' },
  })
  @IsOptional()
  @IsObject()
  role?: { role: string; name?: string };

  @ApiPropertyOptional({
    description: 'Test ID (data-testid, data-qa, etc.)',
    example: 'submit-button',
  })
  @IsOptional()
  @IsString()
  testId?: string;

  @ApiPropertyOptional({
    description: 'Associated label text',
    example: 'Email Address',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    description: 'Placeholder text',
    example: 'Enter your email',
  })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Visible text content',
    example: 'Sign In',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Image alt text',
    example: 'Company Logo',
  })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({
    description: 'Title attribute',
    example: 'Click to submit form',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'CSS selector',
    example: '#login-form > button.primary',
  })
  @IsOptional()
  @IsString()
  css?: string;

  @ApiPropertyOptional({
    description: 'XPath selector (last resort)',
    example: '//button[@type="submit"]',
  })
  @IsOptional()
  @IsString()
  xpath?: string;
}

export class CreateStepDto {
  @ApiProperty({
    description: 'Action type',
    example: 'click',
    enum: ['click', 'fill', 'select', 'navigate', 'assert', 'hover', 'press'],
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Human-readable description of the step',
    example: 'Click on "Submit" button',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({
    description: 'Value for the action (input text, URL, assertion value)',
    example: 'user@example.com',
    maxLength: 5000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  value?: string;

  @ApiPropertyOptional({
    description: 'Locator bundle with multiple selector strategies',
    type: LocatorBundleDto,
  })
  @IsOptional()
  @IsObject()
  locators?: LocatorBundleDto;

  @ApiPropertyOptional({
    description: 'Generated QA ID for the element',
    example: 'qa:button:submit',
  })
  @IsOptional()
  @IsString()
  qaId?: string;

  @ApiPropertyOptional({
    description: 'HTML tag name',
    example: 'button',
  })
  @IsOptional()
  @IsString()
  tagName?: string;

  @ApiPropertyOptional({
    description: 'Input type (for input elements)',
    example: 'text',
  })
  @IsOptional()
  @IsString()
  inputType?: string;

  @ApiPropertyOptional({
    description: 'Page URL where step was recorded',
    example: 'https://example.com/login',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Assertion type (for assert actions)',
    example: 'text_equals',
  })
  @IsOptional()
  @IsString()
  assertionType?: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded screenshot of the element',
  })
  @IsOptional()
  @IsString()
  elementScreenshot?: string;
}
