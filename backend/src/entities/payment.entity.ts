import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentProvider = 'vnpay' | 'momo' | 'stripe' | 'manual';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ type: 'varchar' })
  provider: PaymentProvider;

  @Column({
    name: 'provider_txn_id',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  providerTxnId: string | null;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: PaymentStatus;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Order, (o) => o.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
