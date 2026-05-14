import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Storefront } from '../../entities/storefront.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Template } from '../../entities/template.entity';

@Injectable()
export class StorefrontsService {
  constructor(
    @InjectRepository(Storefront) private storefronts: Repository<Storefront>,
    @InjectRepository(Tenant) private tenants: Repository<Tenant>,
    @InjectRepository(Template) private templates: Repository<Template>,
  ) {}

  async getPublicStorefront(slug: string, page = 1, limit = 20) {
    const tenant = await this.tenants.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException(`Storefront '${slug}' not found`);

    const storefront = await this.storefronts.findOne({
      where: { tenantId: tenant.id },
    });
    if (!storefront || !storefront.isActive) {
      throw new NotFoundException(`Storefront '${slug}' is not available`);
    }

    const [templates, total] = await this.templates.findAndCount({
      where: { tenantId: tenant.id, status: 'published' },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        price: true,
        currency: true,
        viewCount: true,
        purchaseCount: true,
        publishedAt: true,
      },
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        description: tenant.description,
      },
      storefront: {
        bannerUrl: storefront.bannerUrl,
        welcomeText: storefront.welcomeText,
        seoTitle: storefront.seoTitle,
        seoDescription: storefront.seoDescription,
        themeColor: storefront.themeColor,
        socialLinks: storefront.socialLinks,
      },
      templates: { data: templates, total, page, limit },
    };
  }
}
