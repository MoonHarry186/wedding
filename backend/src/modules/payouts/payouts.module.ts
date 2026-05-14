import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { Payout } from '../../entities/payout.entity';
import { PayoutItem } from '../../entities/payout-item.entity';
import { Order } from '../../entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payout, PayoutItem, Order])],
  controllers: [PayoutsController],
  providers: [PayoutsService],
})
export class PayoutsModule {}
