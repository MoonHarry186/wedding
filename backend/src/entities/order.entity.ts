import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'customer_id', type: 'varchar', nullable: true })
  customerId: string | null;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'numeric' })
  subtotal: number;

  @Column({ name: 'platform_fee', type: 'numeric' })
  platformFee: number;

  @Column({ name: 'tenant_revenue', type: 'numeric' })
  tenantRevenue: number;

  @Column({ default: 'VND' })
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (p) => p.order)
  payment: Payment;
}
