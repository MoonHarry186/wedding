import {
  IsString,
  IsBoolean,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVariableDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional({
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
  @IsOptional()
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
  type?:
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
