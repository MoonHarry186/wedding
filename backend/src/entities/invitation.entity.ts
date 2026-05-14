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
import { OrderItem } from './order-item.entity';
import { Template } from './template.entity';
import { TemplateInstance } from './template-instance.entity';
import { Customer } from './customer.entity';
import { InvitationVariable } from './invitation-variable.entity';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ name: 'template_instance_id', type: 'uuid', nullable: true })
  templateInstanceId: string | null;

  @Column({ name: 'customer_id', type: 'varchar', nullable: true })
  customerId: string | null;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'access_token', unique: true })
  accessToken: string;

  @Column({
    name: 'public_slug',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  publicSlug: string | null;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @ManyToOne(() => TemplateInstance, { nullable: true })
  @JoinColumn({ name: 'template_instance_id' })
  templateInstance: TemplateInstance | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => InvitationVariable, (v) => v.invitation, { cascade: true })
  variables: InvitationVariable[];
}
