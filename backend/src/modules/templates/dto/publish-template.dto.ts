import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishTemplateDto {
  @ApiProperty({
    description: 'Canvas JSON data (elements, background, dimensions)',
  })
  @IsObject()
  canvasData: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  changeNote?: string;
}
