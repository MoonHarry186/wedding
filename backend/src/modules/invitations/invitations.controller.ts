import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { FillVariablesDto } from './dto/fill-variables.dto';
import { PublishInvitationDto } from './dto/publish-invitation.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('invitations')
@Controller()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  // ─── Tenant: manage invitations ───────────────────────────────────────────

  @ApiBearerAuth()
  @Get('invitations')
  @ApiOperation({ summary: 'List all invitations for current tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.invitationsService.findAllForTenant(tenantId);
  }

  @ApiBearerAuth()
  @Get('invitations/:id')
  @ApiOperation({ summary: 'Get invitation detail (tenant view)' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.invitationsService.findOne(tenantId, id);
  }

  @ApiBearerAuth()
  @Put('invitations/:id/variables')
  @ApiOperation({ summary: 'Fill / update invitation variables' })
  fillVariables(@Param('id') id: string, @Body() dto: FillVariablesDto) {
    return this.invitationsService.fillVariables(id, dto);
  }

  @ApiBearerAuth()
  @Put('invitations/:id/publish')
  @ApiOperation({ summary: 'Publish invitation — generate public URL' })
  publish(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: PublishInvitationDto,
  ) {
    return this.invitationsService.publish(tenantId, id, dto);
  }

  @ApiBearerAuth()
  @Put('invitations/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish invitation — hide from public' })
  unpublish(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.invitationsService.unpublish(tenantId, id);
  }

  @ApiBearerAuth()
  @Get('invitations/:id/preview')
  @ApiOperation({ summary: 'Preview rendered canvas (tenant)' })
  preview(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.invitationsService.preview(tenantId, id);
  }

  // ─── Guest: fill variables via email access token ─────────────────────────

  @Public()
  @Get('invitations/access/:token')
  @ApiOperation({ summary: 'Access invitation via email token (guest)' })
  findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Public()
  @Put('invitations/access/:token/variables')
  @ApiOperation({ summary: 'Fill variables via email access token' })
  fillByToken(@Param('token') token: string, @Body() dto: FillVariablesDto) {
    // find invitation id from token first, then delegate
    return this.invitationsService
      .findByToken(token)
      .then((res) =>
        this.invitationsService.fillVariables(res.invitation.id, dto, token),
      );
  }

  // ─── Public: view by slug ─────────────────────────────────────────────────

  @Public()
  @Get('w/:slug')
  @ApiOperation({
    summary: 'Public invitation view (rendered canvas + variables)',
  })
  findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findBySlug(slug);
  }
}
