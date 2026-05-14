import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';
import {
  SubscriptionEvent,
  SubscriptionEventType,
} from '../../entities/subscription-event.entity';
import { Tenant } from '../../entities/tenant.entity';
import type { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionEvent)
    private eventRepo: Repository<SubscriptionEvent>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {}

  // ─── Plans ───────────────────────────────────────────────────────────────

  getPlans() {
    return this.planRepo.find({
      where: { isActive: true },
      order: { priceMonthly: 'ASC' },
    });
  }

  getPlanById(id: string) {
    return this.planRepo.findOne({ where: { id, isActive: true } });
  }

  // ─── Current subscription ─────────────────────────────────────────────────

  async getCurrentSubscription(tenantId: string) {
    const sub = await this.subRepo.findOne({
      where: { tenantId },
      relations: ['plan'],
      order: { currentPeriodEnd: 'DESC' },
    });
    if (!sub) throw new NotFoundException('No active subscription found');
    return sub;
  }

  // ─── Checkout ────────────────────────────────────────────────────────────
  // Phase 2: tạo pending subscription + trả về payment URL.
  // Webhook sẽ kích hoạt sau khi provider confirm payment.

  async checkout(tenantId: string, dto: CheckoutDto) {
    const plan = await this.planRepo.findOne({
      where: { id: dto.planId, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (plan.name === 'Free') {
      throw new BadRequestException(
        'Cannot checkout Free plan — it is assigned automatically',
      );
    }

    const currentSub = await this.subRepo.findOne({ where: { tenantId } });
    if (currentSub?.planId === plan.id && currentSub.status === 'active') {
      throw new ConflictException('Already subscribed to this plan');
    }

    const amount =
      dto.billing === 'yearly'
        ? Number(plan.priceYearly)
        : Number(plan.priceMonthly);

    // TODO: integrate real payment gateway (VNPay / Stripe)
    // For now return a mock payment session
    const mockPaymentUrl = this.buildMockPaymentUrl(dto.provider, {
      tenantId,
      planId: plan.id,
      amount,
      billing: dto.billing,
      returnUrl: dto.returnUrl,
    });

    return {
      paymentUrl: mockPaymentUrl,
      amount,
      currency: 'VND',
      plan: { id: plan.id, name: plan.name },
      billing: dto.billing,
    };
  }

  // ─── Activate subscription (called by webhook handler) ───────────────────

  async activateSubscription(params: {
    tenantId: string;
    planId: string;
    billing: 'monthly' | 'yearly';
    provider: string;
    providerTxnId: string;
    amountPaid: number;
  }) {
    const { tenantId, planId, billing, provider, providerTxnId, amountPaid } =
      params;

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now);
    if (billing === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const existingSub = await this.subRepo.findOne({ where: { tenantId } });

    let eventType: SubscriptionEventType;
    let fromPlanId: string | undefined;

    if (!existingSub) {
      eventType = 'created';
    } else {
      const oldPlan = await this.planRepo.findOne({
        where: { id: existingSub.planId },
      });
      fromPlanId = existingSub.planId;
      const oldPrice = Number(oldPlan?.priceMonthly ?? 0);
      const newPrice = Number(plan.priceMonthly);
      if (existingSub.status === 'cancelled') {
        eventType = 'reactivated';
      } else if (newPrice > oldPrice) {
        eventType = 'upgraded';
      } else if (newPrice < oldPrice) {
        eventType = 'downgraded';
      } else {
        eventType = 'renewed';
      }
    }

    let sub: Subscription;
    if (existingSub) {
      existingSub.planId = planId;
      existingSub.status = 'active';
      existingSub.currentPeriodStart = now;
      existingSub.currentPeriodEnd = periodEnd;
      existingSub.cancelAtPeriodEnd = false;
      existingSub.provider = provider;
      existingSub.providerSubId = providerTxnId;
      sub = await this.subRepo.save(existingSub);
    } else {
      sub = await this.subRepo.save(
        this.subRepo.create({
          tenantId,
          planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          provider,
          providerSubId: providerTxnId,
        }),
      );
    }

    await this.eventRepo.save(
      this.eventRepo.create({
        subscriptionId: sub.id,
        tenantId,
        eventType,
        fromPlanId,
        toPlanId: planId,
        amountPaid,
        currency: 'VND',
        provider,
        providerTxnId,
        periodStart: now,
        periodEnd,
      }),
    );

    return sub;
  }

  // ─── Cancel ──────────────────────────────────────────────────────────────

  async cancel(tenantId: string) {
    const sub = await this.subRepo.findOne({ where: { tenantId } });
    if (!sub) throw new NotFoundException('No subscription found');
    if (sub.status === 'cancelled')
      throw new ConflictException('Already cancelled');

    const freePlan = await this.planRepo.findOne({
      where: { name: 'Free', isActive: true },
    });
    if (sub.planId === freePlan?.id) {
      throw new BadRequestException('Cannot cancel Free plan');
    }

    sub.cancelAtPeriodEnd = true;
    await this.subRepo.save(sub);

    await this.eventRepo.save(
      this.eventRepo.create({
        subscriptionId: sub.id,
        tenantId,
        eventType: 'cancelled',
        fromPlanId: sub.planId,
        toPlanId: freePlan?.id,
        periodStart: sub.currentPeriodStart,
        periodEnd: sub.currentPeriodEnd,
      }),
    );

    return {
      message: 'Subscription will be cancelled at period end',
      cancelAt: sub.currentPeriodEnd,
    };
  }

  // ─── History ─────────────────────────────────────────────────────────────

  async getHistory(tenantId: string) {
    return this.eventRepo.find({
      where: { tenantId },
      relations: ['fromPlan', 'toPlan'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  async getPlanForTenant(tenantId: string): Promise<SubscriptionPlan | null> {
    const sub = await this.subRepo.findOne({
      where: { tenantId, status: 'active' },
      relations: ['plan'],
    });
    return sub?.plan ?? null;
  }

  private buildMockPaymentUrl(
    provider: string,
    params: Record<string, unknown>,
  ) {
    const base =
      provider === 'stripe'
        ? 'https://checkout.stripe.com/mock'
        : 'https://sandbox.vnpayment.vn/mock';
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [
        k,
        v === null || v === undefined
          ? ''
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v as string | number | boolean | bigint),
      ]),
    );
    return `${base}?${query.toString()}`;
  }
}
