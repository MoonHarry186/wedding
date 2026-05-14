import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTemplateDto {
  @ApiProperty({
    example: 'Thiệp cưới phong cách tối giản, màu pastel, tiếng Việt',
  })
  @IsString()
  @MaxLength(1000)
  prompt: string;

  @ApiPropertyOptional({ example: 800, default: 800 })
  @IsOptional()
  @IsInt()
  @Min(400)
  @Max(2000)
  width?: number;

  @ApiPropertyOptional({ example: 600, default: 600 })
  @IsOptional()
  @IsInt()
  @Min(400)
  @Max(2000)
  height?: number;
}
