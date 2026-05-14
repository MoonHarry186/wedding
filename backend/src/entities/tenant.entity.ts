import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TenantMember } from './tenant-member.entity';
import { Storefront } from './storefront.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'primary_color', nullable: true })
  primaryColor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'commission_rate', type: 'numeric', default: 10 })
  commissionRate: number;

  @Column({ name: 'payout_info', type: 'jsonb', nullable: true })
  payoutInfo: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TenantMember, (m) => m.tenant)
  members: TenantMember[];

  @OneToOne(() => Storefront, (s) => s.tenant)
  storefront: Storefront;
}
