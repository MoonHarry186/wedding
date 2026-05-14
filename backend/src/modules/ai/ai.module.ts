import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { TenantAIConfig } from '../../entities/tenant-ai-config.entity';
import { AIGenerationLog } from '../../entities/ai-generation-log.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantAIConfig,
      AIGenerationLog,
      SubscriptionPlan,
      Subscription,
    ]),
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
