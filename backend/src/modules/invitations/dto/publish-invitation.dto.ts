import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PublishInvitationDto {
  @ApiPropertyOptional({
    description:
      'Custom slug for the public URL (e.g. lan-va-minh). Auto-generated if omitted.',
    example: 'lan-va-minh-2026',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;
}
