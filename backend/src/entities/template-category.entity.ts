import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('template_categories')
export class TemplateCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId: string | null;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'icon_url', type: 'varchar', nullable: true })
  iconUrl: string | null;

  @ManyToOne(() => TemplateCategory, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: TemplateCategory;

  @OneToMany(() => TemplateCategory, (c) => c.parent)
  children: TemplateCategory[];
}
