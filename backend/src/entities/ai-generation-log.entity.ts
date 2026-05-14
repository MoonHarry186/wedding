import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { TenantAIConfig } from './tenant-ai-config.entity';

export type GenerationStatus = 'success' | 'failed' | 'rejected';

@Entity('ai_generation_logs')
export class AIGenerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'config_id', type: 'varchar', nullable: true })
  configId: string | null;

  @Column({ type: 'varchar' })
  feature: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'varchar' })
  provider: string;

  @Column()
  model: string;

  @Column({ name: 'tokens_input', type: 'int', default: 0 })
  tokensInput: number;

  @Column({ name: 'tokens_output', type: 'int', default: 0 })
  tokensOutput: number;

  @Column({ name: 'cost_usd', type: 'numeric', default: 0 })
  costUsd: number;

  @Column({ type: 'varchar' })
  status: GenerationStatus;

  @Column({ name: 'result_id', type: 'varchar', nullable: true })
  resultId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TenantAIConfig, { nullable: true })
  @JoinColumn({ name: 'config_id' })
  config: TenantAIConfig;
}
