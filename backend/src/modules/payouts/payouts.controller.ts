import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PayoutsService, GeneratePayoutsDto } from './payouts.service';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

class MarkPaidDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

@Controller()
export class PayoutsController {
  constructor(private readonly svc: PayoutsService) {}

  // ─── Tenant-facing ────────────────────────────────────────────────────────

  @Get('payouts')
  listMine(
    @CurrentTenant() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.svc.listForTenant(tenantId, page, limit);
  }

  @Get('payouts/:id')
  getMine(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.svc.getOneForTenant(tenantId, id);
  }

  @Get('payouts/:id/items')
  getMyItems(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.svc.getItemsForTenant(tenantId, id, page, limit);
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @Get('admin/payouts')
  @Roles('owner')
  adminList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.svc.adminList(page, limit);
  }

  @Get('admin/payouts/:id')
  @Roles('owner')
  adminGet(@Param('id') id: string) {
    return this.svc.adminGetOne(id);
  }

  @Get('admin/payouts/:id/items')
  @Roles('owner')
  adminGetItems(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.svc.adminGetItems(id, page, limit);
  }

  @Post('admin/payouts/generate')
  @Roles('owner')
  generate(@Body() dto: GeneratePayoutsDto) {
    return this.svc.generatePayouts(dto);
  }

  @Put('admin/payouts/:id/process')
  @Roles('owner')
  process(@Param('id') id: string) {
    return this.svc.processPayout(id);
  }

  @Put('admin/payouts/:id/mark-paid')
  @Roles('owner')
  markPaid(@Param('id') id: string, @Body() body: MarkPaidDto) {
    return this.svc.markPaid(id, body.note);
  }
}
