import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Tenant } from './tenant.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export type SubscriptionEventType =
  | 'created'
  | 'renewed'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'reactivated'
  | 'past_due';

@Entity('subscription_events')
export class SubscriptionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: SubscriptionEventType;

  @Column({ name: 'from_plan_id', nullable: true })
  fromPlanId: string;

  @Column({ name: 'to_plan_id', nullable: true })
  toPlanId: string;

  @Column({ name: 'amount_paid', type: 'numeric', nullable: true })
  amountPaid: number;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  provider: string;

  @Column({ name: 'provider_txn_id', nullable: true })
  providerTxnId: string;

  @Column({ name: 'period_start', type: 'timestamptz', nullable: true })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamptz', nullable: true })
  periodEnd: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'from_plan_id' })
  fromPlan: SubscriptionPlan;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'to_plan_id' })
  toPlan: SubscriptionPlan;
}
