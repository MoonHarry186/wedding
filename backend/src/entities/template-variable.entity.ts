import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Template } from './template.entity';

export type VariableType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'image'
  | 'number'
  | 'color'
  | 'url'
  | 'address'
  | 'json';

@Entity('template_variables')
export class TemplateVariable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column()
  key: string;

  @Column()
  label: string;

  @Column({ type: 'varchar' })
  type: VariableType;

  @Column({ default: false })
  required: boolean;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue: string | null;

  @Column({ type: 'varchar', nullable: true })
  placeholder: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Template, (t) => t.variables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: Template;
}
