import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import {
  UpdateStorefrontDto,
  SetCustomDomainDto,
} from './dto/update-storefront.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants/me')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current tenant + user info' })
  async getTenant(
    @CurrentTenant() tenantId: string,
    @CurrentUser()
    user: { id: string; email: string; fullName: string; tenantRole: string },
  ) {
    const tenant = await this.tenantsService.findById(tenantId);
    return {
      ...tenant,
      currentUser: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.tenantRole,
      },
    };
  }

  @Put()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update tenant info' })
  updateTenant(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(tenantId, dto);
  }

  @Get('members')
  @ApiOperation({ summary: 'List tenant members' })
  getMembers(@CurrentTenant() tenantId: string) {
    return this.tenantsService.getMembers(tenantId);
  }

  @Post('members/invite')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Invite a user to this tenant' })
  inviteMember(
    @CurrentTenant() tenantId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.tenantsService.inviteMember(tenantId, dto);
  }

  @Put('members/:id/role')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Change member role' })
  updateRole(
    @CurrentTenant() tenantId: string,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.tenantsService.updateMemberRole(
      tenantId,
      memberId,
      dto,
      user.id,
    );
  }

  @Delete('members/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Remove a member' })
  removeMember(
    @CurrentTenant() tenantId: string,
    @Param('id') memberId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.tenantsService.removeMember(tenantId, memberId, user.id);
  }

  // ─── Storefront ──────────────────────────────────────────────────────────

  @Get('storefront')
  @ApiOperation({ summary: 'Get my storefront settings' })
  getStorefront(@CurrentTenant() tenantId: string) {
    return this.tenantsService.getStorefront(tenantId);
  }

  @Put('storefront')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update storefront settings' })
  updateStorefront(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateStorefrontDto,
  ) {
    return this.tenantsService.updateStorefront(tenantId, dto);
  }

  @Post('storefront/domain')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Set custom domain and get verification token' })
  setDomain(
    @CurrentTenant() tenantId: string,
    @Body() dto: SetCustomDomainDto,
  ) {
    return this.tenantsService.setCustomDomain(tenantId, dto);
  }

  @Post('storefront/verify-domain')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Verify custom domain via DNS TXT record' })
  verifyDomain(@CurrentTenant() tenantId: string) {
    return this.tenantsService.verifyDomain(tenantId);
  }
}
