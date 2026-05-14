import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Storefront } from '../../entities/storefront.entity';
import { Tenant } from '../../entities/tenant.entity';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Storefront)
    private storefrontRepo: Repository<Storefront>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.hostname;
    const appDomain = process.env.APP_DOMAIN || 'cinlove.vn';

    // 1. Custom domain
    if (!host.endsWith(`.${appDomain}`) && host !== appDomain) {
      const storefront = await this.storefrontRepo.findOne({
        where: { customDomain: host, domainVerified: true },
      });
      if (storefront) {
        req['tenantId'] = storefront.tenantId;
        return next();
      }
    }

    // 2. Subdomain *.cinlove.vn
    if (host.endsWith(`.${appDomain}`)) {
      const slug = host.replace(`.${appDomain}`, '');
      if (slug) {
        const tenant = await this.tenantRepo.findOne({ where: { slug } });
        if (tenant) {
          req['tenantId'] = tenant.id;
          return next();
        }
        throw new NotFoundException(`Tenant '${slug}' not found`);
      }
    }

    // 3. Fallback: extract tenantId from JWT Bearer token (for localhost / direct API)
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const token = auth.slice(7);
        const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
        const payload = jwt.verify(token, secret) as { tenantId?: string };
        if (payload.tenantId) {
          req['tenantId'] = payload.tenantId;
        }
      } catch {
        // invalid/expired token — let guards handle it
      }
    }

    next();
  }
}
