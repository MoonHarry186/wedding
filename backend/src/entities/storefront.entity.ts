import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('storefronts')
export class Storefront {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', unique: true })
  tenantId: string;

  @Column({ name: 'custom_domain', nullable: true })
  customDomain: string;

  @Column({ name: 'domain_verified', default: false })
  domainVerified: boolean;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl: string;

  @Column({ name: 'welcome_text', type: 'text', nullable: true })
  welcomeText: string;

  @Column({ name: 'seo_title', nullable: true })
  seoTitle: string;

  @Column({ name: 'seo_description', nullable: true })
  seoDescription: string;

  @Column({ name: 'theme_color', nullable: true })
  themeColor: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks: Record<string, string>;

  @Column({
    name: 'domain_verification_token',
    type: 'varchar',
    nullable: true,
  })
  domainVerificationToken: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => Tenant, (t) => t.storefront)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
