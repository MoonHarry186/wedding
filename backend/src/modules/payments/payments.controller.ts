import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get payment detail' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // ─── Webhooks (public — verified by provider signature) ──────────────────

  @Public()
  @Post('vnpay/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VNPay IPN webhook' })
  vnpayWebhook(@Body() body: Record<string, string>) {
    return this.paymentsService.handleVNPayWebhook(body);
  }

  @Public()
  @Post('momo/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MoMo IPN webhook' })
  momoWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleMoMoWebhook(body);
  }

  @Public()
  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook (use raw body for signature verification)',
  })
  stripeWebhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.handleStripeWebhook(body);
  }

  // ─── Dev: simulate payment success (non-production only) ─────────────────

  @Public()
  @Post('dev/confirm/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[DEV ONLY] Simulate payment success for an order' })
  devConfirm(@Param('orderId') orderId: string) {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }
    return this.paymentsService.processPaymentResult({
      orderId,
      provider: 'dev',
      txnId: `dev-${Date.now()}`,
      amount: 0,
      success: true,
      rawResponse: { simulated: true },
    });
  }
}
