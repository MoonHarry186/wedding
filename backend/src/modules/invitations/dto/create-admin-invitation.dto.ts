import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateAdminInvitationDto {
  @ApiProperty({
    enum: ['blank', 'from_template'],
    description: 'Quick create a blank invitation or start from a template',
  })
  @IsIn(['blank', 'from_template'])
  mode: 'blank' | 'from_template';

  @ApiPropertyOptional({
    description: 'Published template id when mode is from_template',
  })
  @ValidateIf((dto: CreateAdminInvitationDto) => dto.mode === 'from_template')
  @IsUUID()
  @IsOptional()
  templateId?: string;
}
