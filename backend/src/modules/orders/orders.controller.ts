import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Public()
  @Post('checkout')
  @ApiOperation({
    summary: 'Create order + payment session (guest or logged-in customer)',
  })
  checkout(
    @CurrentTenant() tenantId: string,
    @Body() dto: CheckoutOrderDto,
    @CurrentUser() user?: { id: string; type?: string },
  ) {
    const customerId = user?.type === 'customer' ? user.id : undefined;
    return this.ordersService.checkout(tenantId, dto, customerId);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'List orders for current tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.ordersService.findAll(tenantId);
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.ordersService.findOne(tenantId, id);
  }
}
