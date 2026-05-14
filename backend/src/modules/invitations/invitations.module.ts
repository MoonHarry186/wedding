import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../../entities/invitation.entity';
import { InvitationVariable } from '../../entities/invitation-variable.entity';
import { TemplateVariable } from '../../entities/template-variable.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invitation,
      InvitationVariable,
      TemplateVariable,
      TemplateInstance,
    ]),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
