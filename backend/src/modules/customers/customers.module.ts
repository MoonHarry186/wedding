import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { Customer } from '../../entities/customer.entity';
import { Order } from '../../entities/order.entity';
import { Invitation } from '../../entities/invitation.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Order, Invitation, TemplateInstance]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.accessSecret'),
        signOptions: { expiresIn: config.get('jwt.accessExpires') },
      }),
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomerJwtStrategy],
  exports: [CustomersService],
})
export class CustomersModule {}
