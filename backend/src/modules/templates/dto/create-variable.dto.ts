import {
  IsString,
  IsBoolean,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariableDto {
  @ApiProperty({ example: 'bride_name' })
  @IsString()
  @MaxLength(100)
  key: string;

  @ApiProperty({ example: 'Tên cô dâu' })
  @IsString()
  @MaxLength(200)
  label: string;

  @ApiProperty({
    enum: [
      'text',
      'date',
      'datetime',
      'image',
      'number',
      'color',
      'url',
      'address',
      'json',
    ],
  })
  @IsIn([
    'text',
    'date',
    'datetime',
    'image',
    'number',
    'color',
    'url',
    'address',
    'json',
  ])
  type:
    | 'text'
    | 'date'
    | 'datetime'
    | 'image'
    | 'number'
    | 'color'
    | 'url'
    | 'address'
    | 'json';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
