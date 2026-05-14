import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    example: 'my-wedding-shop',
    description: 'Subdomain slug for the tenant',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  tenantSlug: string;

  @ApiProperty({ example: 'My Wedding Shop' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  tenantName: string;
}
