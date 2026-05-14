import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../../entities/user.entity';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMember } from '../../entities/tenant-member.entity';
import { Storefront } from '../../entities/storefront.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';
import { MailModule } from '../../common/mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([
      User,
      Tenant,
      TenantMember,
      Storefront,
      SubscriptionPlan,
      Subscription,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.accessSecret'),
        signOptions: { expiresIn: config.get('jwt.accessExpires') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
