import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorefrontsController } from './storefronts.controller';
import { StorefrontsService } from './storefronts.service';
import { Storefront } from '../../entities/storefront.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Template } from '../../entities/template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Storefront, Tenant, Template])],
  controllers: [StorefrontsController],
  providers: [StorefrontsService],
})
export class StorefrontsModule {}
