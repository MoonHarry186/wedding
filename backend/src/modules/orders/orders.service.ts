import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Payment } from '../../entities/payment.entity';
import { Template } from '../../entities/template.entity';
import { Tenant } from '../../entities/tenant.entity';
import type { CheckoutOrderDto } from './dto/checkout-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Template) private templateRepo: Repository<Template>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async checkout(tenantId: string, dto: CheckoutOrderDto, customerId?: string) {
    // Load and validate all templates
    const templates = await this.templateRepo.find({
      where: { id: In(dto.templateIds), tenantId },
    });

    if (templates.length !== dto.templateIds.length) {
      const found = templates.map((t) => t.id);
      const missing = dto.templateIds.filter((id) => !found.includes(id));
      throw new NotFoundException(`Templates not found: ${missing.join(', ')}`);
    }

    const unpublished = templates.filter((t) => t.status !== 'published');
    if (unpublished.length > 0) {
      throw new BadRequestException(
        `Templates not published: ${unpublished.map((t) => t.title).join(', ')}`,
      );
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const subtotal = templates.reduce((sum, t) => sum + Number(t.price), 0);
    const commissionRate = Number(tenant.commissionRate) / 100;
    const platformFee = Math.round(subtotal * commissionRate);
    const tenantRevenue = subtotal - platformFee;

    return this.dataSource.transaction(async (em) => {
      const order = em.create(Order, {
        tenantId,
        customerId: customerId ?? null,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        status: 'pending',
        subtotal,
        platformFee,
        tenantRevenue,
        currency: templates[0]?.currency ?? 'VND',
      });
      await em.save(order);

      const items = templates.map((t) =>
        em.create(OrderItem, {
          orderId: order.id,
          templateId: t.id,
          templateTitle: t.title,
          unitPrice: t.price,
        }),
      );
      await em.save(items);

      const payment = em.create(Payment, {
        orderId: order.id,
        provider: dto.provider,
        amount: subtotal,
        currency: order.currency,
        status: 'pending',
      });
      await em.save(payment);

      const paymentUrl = this.buildPaymentUrl(dto.provider, {
        orderId: order.id,
        amount: subtotal,
        returnUrl: dto.returnUrl,
      });

      return { order, items, payment, paymentUrl };
    });
  }

  async findOne(tenantId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, tenantId },
      relations: ['items', 'payment'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  findAll(tenantId: string) {
    return this.orderRepo.find({
      where: { tenantId },
      relations: ['items', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  private buildPaymentUrl(provider: string, params: Record<string, unknown>) {
    const bases: Record<string, string> = {
      vnpay: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      momo: 'https://test-payment.momo.vn/gw_payment/transactionProcessor',
      stripe: 'https://checkout.stripe.com/pay/mock',
    };
    const base = bases[provider] ?? 'https://payment.mock';
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [
        k,
        v === null || v === undefined
          ? ''
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v as string | number | boolean | bigint),
      ]),
    );
    return `${base}?${qs.toString()}`;
  }
}
