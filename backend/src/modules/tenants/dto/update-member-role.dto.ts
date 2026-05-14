import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['admin', 'editor'] })
  @IsIn(['admin', 'editor'])
  role: 'admin' | 'editor';
}
