import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMember } from '../../entities/tenant-member.entity';
import { User } from '../../entities/user.entity';
import { Storefront } from '../../entities/storefront.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMember, User, Storefront])],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
