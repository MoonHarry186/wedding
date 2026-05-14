import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { PayoutItem } from './payout-item.entity';

export type PayoutStatus = 'pending' | 'processing' | 'paid';

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: string;

  @Column({ name: 'total_revenue', type: 'numeric' })
  totalRevenue: number;

  @Column({ name: 'platform_fee_total', type: 'numeric' })
  platformFeeTotal: number;

  @Column({ name: 'payout_amount', type: 'numeric' })
  payoutAmount: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: PayoutStatus;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => PayoutItem, (i) => i.payout, { cascade: true })
  items: PayoutItem[];
}
