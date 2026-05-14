import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Template } from './template.entity';
import { User } from './user.entity';

@Entity('template_versions')
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ name: 'saved_by' })
  savedBy: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'canvas_data', type: 'jsonb' })
  canvasData: Record<string, unknown>;

  @Column({ name: 'change_note', type: 'varchar', nullable: true })
  changeNote: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Template, (t) => t.versions)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'saved_by' })
  savedByUser: User;
}
