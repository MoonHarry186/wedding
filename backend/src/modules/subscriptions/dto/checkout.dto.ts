import { IsUUID, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ description: 'ID của subscription_plan muốn đăng ký' })
  @IsUUID()
  planId: string;

  @ApiProperty({ enum: ['monthly', 'yearly'] })
  @IsIn(['monthly', 'yearly'])
  billing: 'monthly' | 'yearly';

  @ApiProperty({ enum: ['vnpay', 'stripe'] })
  @IsIn(['vnpay', 'stripe'])
  provider: 'vnpay' | 'stripe';

  @ApiPropertyOptional({ description: 'URL redirect sau khi thanh toán xong' })
  @IsOptional()
  returnUrl?: string;
}
