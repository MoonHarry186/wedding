import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateImageDto {
  @ApiProperty({
    example: 'Hoa anh đào nở rộ, phong cách watercolor, nền trắng',
  })
  @IsString()
  @MaxLength(1000)
  prompt: string;
}
