import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // ─── Public: plan list ────────────────────────────────────────────────────

  @Public()
  @Get('subscriptions/plans')
  @ApiOperation({ summary: 'List all active subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  // ─── Tenant: subscription management ─────────────────────────────────────

  @ApiBearerAuth()
  @Get('tenants/me/subscription')
  @ApiOperation({ summary: 'Get current subscription of tenant' })
  getCurrent(@CurrentTenant() tenantId: string) {
    return this.subscriptionsService.getCurrentSubscription(tenantId);
  }

  @ApiBearerAuth()
  @Post('tenants/me/subscription/checkout')
  @ApiOperation({
    summary: 'Create a payment session to subscribe / upgrade / renew',
  })
  checkout(@CurrentTenant() tenantId: string, @Body() dto: CheckoutDto) {
    return this.subscriptionsService.checkout(tenantId, dto);
  }

  @ApiBearerAuth()
  @Post('tenants/me/subscription/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  cancel(@CurrentTenant() tenantId: string) {
    return this.subscriptionsService.cancel(tenantId);
  }

  @ApiBearerAuth()
  @Get('tenants/me/subscription/history')
  @ApiOperation({ summary: 'Get subscription event history' })
  getHistory(@CurrentTenant() tenantId: string) {
    return this.subscriptionsService.getHistory(tenantId);
  }
}
