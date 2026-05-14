import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VariableValueDto {
  @ApiProperty({ example: 'bride_name' })
  @IsString()
  key: string;

  @ApiPropertyOptional({ example: 'Nguyễn Thị Lan' })
  @IsOptional()
  @IsString()
  valueText?: string;

  @ApiPropertyOptional({ description: 'For image/structured data' })
  @IsOptional()
  @IsObject()
  valueJson?: Record<string, unknown>;
}

export class FillVariablesDto {
  @ApiProperty({ type: [VariableValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariableValueDto)
  variables: VariableValueDto[];
}
