import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invitation } from './invitation.entity';

@Entity('invitation_variables')
export class InvitationVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invitation_id' })
  invitationId: string;

  @Column({ name: 'variable_key' })
  variableKey: string;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string | null;

  @Column({ name: 'value_json', type: 'jsonb', nullable: true })
  valueJson: Record<string, unknown> | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Invitation, (inv) => inv.variables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitation_id' })
  invitation: Invitation;
}
