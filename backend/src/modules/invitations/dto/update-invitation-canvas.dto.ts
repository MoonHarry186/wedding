import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateInvitationCanvasDto {
  @ApiProperty({ description: 'Canvas data snapshot for this invitation' })
  @IsObject()
  canvasData: Record<string, unknown>;
}
