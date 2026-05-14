import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'price_monthly', type: 'numeric' })
  priceMonthly: number;

  @Column({ name: 'price_yearly', type: 'numeric' })
  priceYearly: number;

  @Column({ name: 'max_templates', type: 'int', nullable: true })
  maxTemplates: number;

  @Column({ name: 'max_members', type: 'int', nullable: true })
  maxMembers: number;

  @Column({ name: 'custom_domain', default: false })
  customDomain: boolean;

  @Column({ default: false })
  analytics: boolean;

  @Column({ name: 'marketplace_listing', default: false })
  marketplaceListing: boolean;

  @Column({ name: 'ai_byok', default: false })
  aiBYOK: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
