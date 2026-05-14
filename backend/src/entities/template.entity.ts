import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { TemplateCategory } from './template-category.entity';
import { TemplateVariable } from './template-variable.entity';
import { TemplateVersion } from './template-version.entity';

export type TemplateStatus = 'private' | 'published';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'category_id', type: 'varchar', nullable: true })
  categoryId: string | null;

  @Column({ name: 'current_version_id', type: 'varchar', nullable: true })
  currentVersionId: string | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'thumbnail_url', type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'varchar', default: 'private' })
  status: TemplateStatus;

  @Column({ type: 'numeric', default: 0 })
  price: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'purchase_count', default: 0 })
  purchaseCount: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => TemplateCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: TemplateCategory;

  @OneToMany(() => TemplateVariable, (v) => v.template)
  variables: TemplateVariable[];

  @OneToMany(() => TemplateVersion, (v) => v.template)
  versions: TemplateVersion[];
}
