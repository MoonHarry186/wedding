import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export type AIFeature = 'template_gen' | 'image_gen' | 'variable_extract';
export type AIProvider = 'anthropic' | 'openai' | 'google' | 'stability';

@Entity('tenant_ai_configs')
export class TenantAIConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'varchar' })
  feature: AIFeature;

  @Column({ type: 'varchar' })
  provider: AIProvider;

  @Column()
  model: string;

  @Column({ name: 'api_key_enc', type: 'text' })
  apiKeyEnc: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
