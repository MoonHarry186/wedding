import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

import { JwtAuthGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TenantResolverMiddleware } from './common/interceptors/tenant-context.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { MediaModule } from './modules/media/media.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AIModule } from './modules/ai/ai.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { StorefrontsModule } from './modules/storefronts/storefronts.module';

import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantMember } from './entities/tenant-member.entity';
import { Storefront } from './entities/storefront.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionEvent } from './entities/subscription-event.entity';
import { Template } from './entities/template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { TemplateInstance } from './entities/template-instance.entity';
import { TemplateVariable } from './entities/template-variable.entity';
import { TemplateCategory } from './entities/template-category.entity';
import { MediaFile } from './entities/media-file.entity';
import { Customer } from './entities/customer.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Invitation } from './entities/invitation.entity';
import { InvitationVariable } from './entities/invitation-variable.entity';
import { TenantAIConfig } from './entities/tenant-ai-config.entity';
import { AIGenerationLog } from './entities/ai-generation-log.entity';
import { Payout } from './entities/payout.entity';
import { PayoutItem } from './entities/payout-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [
          User,
          Tenant,
          TenantMember,
          Storefront,
          SubscriptionPlan,
          Subscription,
          SubscriptionEvent,
          Template,
          TemplateVersion,
          TemplateInstance,
          TemplateVariable,
          TemplateCategory,
          MediaFile,
          Customer,
          Order,
          OrderItem,
          Payment,
          Invitation,
          InvitationVariable,
          TenantAIConfig,
          AIGenerationLog,
          Payout,
          PayoutItem,
        ],
        migrations: [__dirname + '/migrations/*.{ts,js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Storefront, Tenant]),
    AuthModule,
    UsersModule,
    TenantsModule,
    SubscriptionsModule,
    TemplatesModule,
    MediaModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    InvitationsModule,
    AIModule,
    PayoutsModule,
    StorefrontsModule,
  ],
  providers: [
    TenantResolverMiddleware,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
