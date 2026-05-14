import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Template } from './template.entity';
import { TemplateVersion } from './template-version.entity';
import { Invitation } from './invitation.entity';

@Entity('template_instances')
export class TemplateInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_template_id', type: 'uuid', nullable: true })
  sourceTemplateId: string | null;

  @Column({ name: 'source_template_version_id', nullable: true })
  sourceTemplateVersionId: string | null;

  @Column({ name: 'canvas_data', type: 'jsonb' })
  canvasData: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'source_template_id' })
  sourceTemplate: Template | null;

  @ManyToOne(() => TemplateVersion, { nullable: true })
  @JoinColumn({ name: 'source_template_version_id' })
  sourceTemplateVersion: TemplateVersion | null;

  @OneToMany(() => Invitation, (invitation) => invitation.templateInstance)
  invitations: Invitation[];
}
