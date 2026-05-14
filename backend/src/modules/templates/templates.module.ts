import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from '../../entities/template.entity';
import { TemplateVersion } from '../../entities/template-version.entity';
import { TemplateVariable } from '../../entities/template-variable.entity';
import { TemplateCategory } from '../../entities/template-category.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Template,
      TemplateVersion,
      TemplateVariable,
      TemplateCategory,
    ]),
    SubscriptionsModule,
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
