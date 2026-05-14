import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractVariablesDto {
  @ApiProperty({
    example:
      'Trân trọng kính mời Quý khách đến dự lễ cưới của Lan và Minh vào lúc 18:00 ngày 15/8/2026 tại Nhà hàng Hoa Hồng, 123 Lê Lợi, Quận 1',
  })
  @IsString()
  @MaxLength(2000)
  text: string;
}
