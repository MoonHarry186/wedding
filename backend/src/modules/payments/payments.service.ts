import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Payment } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Template } from '../../entities/template.entity';
import { TemplateVersion } from '../../entities/template-version.entity';
import { Invitation } from '../../entities/invitation.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    private dataSource: DataSource,
  ) {}

  async findOne(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // ─── VNPay webhook ────────────────────────────────────────────────────────
  async handleVNPayWebhook(body: Record<string, string>) {
    // VNPay signs with HMACSHA512 — verify before processing
    // Simplified: check vnp_ResponseCode === '00' means success
    const txnId = body['vnp_TransactionNo'];
    const orderId = body['vnp_TxnRef'];
    const responseCode = body['vnp_ResponseCode'];
    const amount = Number(body['vnp_Amount']) / 100; // VNPay sends amount * 100

    if (!orderId || !txnId)
      throw new BadRequestException('Invalid webhook payload');

    const isSuccess = responseCode === '00';
    return this.processPaymentResult({
      orderId,
      provider: 'vnpay',
      txnId,
      amount,
      success: isSuccess,
      rawResponse: body,
    });
  }

  // ─── MoMo webhook ─────────────────────────────────────────────────────────
  async handleMoMoWebhook(body: Record<string, unknown>) {
    const orderId = body['orderId'] as string;
    const txnId = body['transId'] as string;
    const resultCode = body['resultCode'] as number;
    const amount = body['amount'] as number;

    if (!orderId || !txnId)
      throw new BadRequestException('Invalid webhook payload');

    return this.processPaymentResult({
      orderId,
      provider: 'momo',
      txnId: String(txnId),
      amount: Number(amount),
      success: resultCode === 0,
      rawResponse: body,
    });
  }

  // ─── Stripe webhook ───────────────────────────────────────────────────────
  async handleStripeWebhook(body: Record<string, unknown>) {
    const event = body as {
      type: string;
      data: { object: Record<string, unknown> };
    };
    if (
      !['checkout.session.completed', 'payment_intent.succeeded'].includes(
        event.type,
      )
    ) {
      return { received: true }; // ignore other events
    }

    const session = event.data.object;
    const orderId = (session['metadata'] as Record<string, string>)?.orderId;
    const txnId = session['id'] as string;
    const amount = Number(session['amount_total'] ?? 0) / 100;

    if (!orderId) return { received: true };

    return this.processPaymentResult({
      orderId,
      provider: 'stripe',
      txnId,
      amount,
      success: true,
      rawResponse: session,
    });
  }

  // ─── Core: process result + create invitations ────────────────────────────
  async processPaymentResult(params: {
    orderId: string;
    provider: string;
    txnId: string;
    amount: number;
    success: boolean;
    rawResponse: Record<string, unknown>;
  }) {
    const { orderId, txnId, success, rawResponse } = params;

    return this.dataSource.transaction(async (em) => {
      const order = await em.findOne(Order, {
        where: { id: orderId },
        relations: ['items'],
      });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);
      if (order.status === 'paid') {
        this.logger.warn(`Duplicate webhook for already-paid order ${orderId}`);
        return { alreadyProcessed: true };
      }

      const payment = await em.findOne(Payment, { where: { orderId } });
      if (!payment) throw new NotFoundException('Payment record not found');

      payment.providerTxnId = txnId;
      payment.providerResponse = rawResponse;
      payment.status = success ? 'success' : 'failed';
      await em.save(payment);

      if (!success) {
        order.status = 'failed';
        await em.save(order);
        return { success: false };
      }

      order.status = 'paid';
      order.paidAt = new Date();
      await em.save(order);

      // Increment purchase count on each template
      for (const item of order.items) {
        await em.increment(
          Template,
          { id: item.templateId },
          'purchaseCount',
          1,
        );
      }

      // Create one invitation per order item
      const invitations: Invitation[] = [];
      for (const item of order.items) {
        if (!item.templateId) {
          this.logger.warn(
            `Order item ${item.id} has no template — skipping invitation generation`,
          );
          continue;
        }

        const template = await em.findOne(Template, {
          where: { id: item.templateId },
        });
        if (!template?.currentVersionId) {
          this.logger.warn(
            `Template ${item.templateId} has no published version — skipping invitation`,
          );
          continue;
        }

        const templateVersion = await em.findOne(TemplateVersion, {
          where: { id: template.currentVersionId },
        });
        if (!templateVersion) {
          this.logger.warn(
            `Template ${item.templateId} current version ${template.currentVersionId} not found — skipping invitation`,
          );
          continue;
        }

        const templateInstance = await em.save(
          em.create(TemplateInstance, {
            sourceTemplateId: item.templateId,
            sourceTemplateVersionId: templateVersion.id,
            canvasData: templateVersion.canvasData,
          }),
        );

        const invitation = em.create(Invitation, {
          orderItemId: item.id,
          templateId: item.templateId,
          templateInstanceId: templateInstance.id,
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          accessToken: randomUUID(),
          isPublic: false,
        });
        invitations.push(await em.save(invitation));
      }

      this.logger.log(
        `Payment success: order=${orderId}, invitations created=${invitations.length}`,
      );

      // TODO: send email to customer with access tokens (Phase 5 / SendGrid)

      return { success: true, orderId, invitations };
    });
  }
}
