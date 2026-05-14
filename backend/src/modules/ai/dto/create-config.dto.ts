import { IsString, IsIn, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAIConfigDto {
  @ApiProperty({ enum: ['template_gen', 'image_gen', 'variable_extract'] })
  @IsIn(['template_gen', 'image_gen', 'variable_extract'])
  feature: 'template_gen' | 'image_gen' | 'variable_extract';

  @ApiProperty({ enum: ['anthropic', 'openai', 'google', 'stability'] })
  @IsIn(['anthropic', 'openai', 'google', 'stability'])
  provider: 'anthropic' | 'openai' | 'google' | 'stability';

  @ApiProperty({ example: 'claude-sonnet-4-6' })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Plain-text API key — will be encrypted before storage',
  })
  @IsString()
  apiKey: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
