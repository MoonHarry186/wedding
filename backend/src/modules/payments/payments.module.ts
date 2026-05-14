import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Template } from '../../entities/template.entity';
import { Invitation } from '../../entities/invitation.entity';
import { TemplateVersion } from '../../entities/template-version.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Order,
      OrderItem,
      Template,
      TemplateVersion,
      TemplateInstance,
      Invitation,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
