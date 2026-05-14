import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payout } from './payout.entity';
import { Order } from './order.entity';

@Entity('payout_items')
export class PayoutItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payout_id' })
  payoutId: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'tenant_revenue', type: 'numeric' })
  tenantRevenue: number;

  @Column({ name: 'platform_fee', type: 'numeric' })
  platformFee: number;

  @Column({ name: 'order_paid_at', type: 'timestamptz', nullable: true })
  orderPaidAt: Date | null;

  @ManyToOne(() => Payout, (p) => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payout_id' })
  payout: Payout;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
