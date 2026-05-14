import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IsDateString } from 'class-validator';
import { Payout } from '../../entities/payout.entity';
import { PayoutItem } from '../../entities/payout-item.entity';
import { Order } from '../../entities/order.entity';

export class GeneratePayoutsDto {
  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;
}

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout) private payouts: Repository<Payout>,
    @InjectRepository(PayoutItem) private payoutItems: Repository<PayoutItem>,
    @InjectRepository(Order) private orders: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  // ─── Tenant endpoints ────────────────────────────────────────────────────

  async listForTenant(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await this.payouts.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getOneForTenant(tenantId: string, id: string) {
    const payout = await this.payouts.findOne({ where: { id, tenantId } });
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }

  async getItemsForTenant(
    tenantId: string,
    payoutId: string,
    page = 1,
    limit = 50,
  ) {
    const payout = await this.payouts.findOne({
      where: { id: payoutId, tenantId },
    });
    if (!payout) throw new NotFoundException('Payout not found');

    const [data, total] = await this.payoutItems.findAndCount({
      where: { payoutId },
      relations: ['order'],
      order: { orderPaidAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  async adminList(page = 1, limit = 50) {
    const [data, total] = await this.payouts.findAndCount({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async adminGetOne(id: string) {
    const payout = await this.payouts.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!payout) throw new NotFoundException('Payout not found');
    return payout;
  }

  async adminGetItems(payoutId: string, page = 1, limit = 100) {
    await this.adminGetOne(payoutId);
    const [data, total] = await this.payoutItems.findAndCount({
      where: { payoutId },
      relations: ['order'],
      order: { orderPaidAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async generatePayouts(dto: GeneratePayoutsDto) {
    const { periodStart, periodEnd } = dto;

    // Find paid orders in period that are not yet assigned to a payout_item
    const unpaidOrders = await this.orders
      .createQueryBuilder('o')
      .leftJoin('payout_items', 'pi', 'pi.order_id = o.id')
      .where('o.status = :status', { status: 'paid' })
      .andWhere('o.paid_at >= :start', { start: periodStart })
      .andWhere('o.paid_at <= :end', { end: periodEnd + ' 23:59:59' })
      .andWhere('pi.id IS NULL')
      .getMany();

    if (unpaidOrders.length === 0) {
      return { created: 0, message: 'No unpaid orders found for this period' };
    }

    // Group by tenant
    const byTenant = new Map<string, typeof unpaidOrders>();
    for (const order of unpaidOrders) {
      const list = byTenant.get(order.tenantId) ?? [];
      list.push(order);
      byTenant.set(order.tenantId, list);
    }

    const created: Payout[] = [];

    await this.dataSource.transaction(async (em) => {
      for (const [tenantId, orders] of byTenant) {
        const totalRevenue = orders.reduce(
          (s, o) => s + Number(o.tenantRevenue),
          0,
        );
        const platformFeeTotal = orders.reduce(
          (s, o) => s + Number(o.platformFee),
          0,
        );

        const payout = em.create(Payout, {
          tenantId,
          periodStart,
          periodEnd,
          totalRevenue,
          platformFeeTotal,
          payoutAmount: totalRevenue,
          status: 'pending',
        });
        const saved = await em.save(Payout, payout);

        const items = orders.map((o) =>
          em.create(PayoutItem, {
            payoutId: saved.id,
            orderId: o.id,
            tenantRevenue: Number(o.tenantRevenue),
            platformFee: Number(o.platformFee),
            orderPaidAt: o.paidAt,
          }),
        );
        await em.save(PayoutItem, items);
        created.push(saved);
      }
    });

    return { created: created.length, payouts: created };
  }

  async processPayout(id: string) {
    const payout = await this.adminGetOne(id);
    if (payout.status !== 'pending') {
      throw new BadRequestException(`Payout is already ${payout.status}`);
    }
    payout.status = 'processing';
    payout.processedAt = new Date();
    return this.payouts.save(payout);
  }

  async markPaid(id: string, note?: string) {
    const payout = await this.adminGetOne(id);
    if (payout.status !== 'processing') {
      throw new BadRequestException(
        `Payout must be in processing state, current: ${payout.status}`,
      );
    }
    payout.status = 'paid';
    payout.paidAt = new Date();
    if (note) payout.note = note;
    return this.payouts.save(payout);
  }
}
