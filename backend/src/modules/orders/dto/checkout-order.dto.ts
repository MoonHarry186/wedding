import {
  IsEmail,
  IsString,
  IsArray,
  IsUUID,
  IsIn,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutOrderDto {
  @ApiProperty({
    type: [String],
    description: 'Array of template IDs to purchase',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  templateIds: string[];

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName: string;

  @ApiProperty({ enum: ['vnpay', 'momo', 'stripe'] })
  @IsIn(['vnpay', 'momo', 'stripe'])
  provider: 'vnpay' | 'momo' | 'stripe';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnUrl?: string;
}
