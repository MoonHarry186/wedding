import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invitation } from '../../entities/invitation.entity';
import { InvitationVariable } from '../../entities/invitation-variable.entity';
import { TemplateVariable } from '../../entities/template-variable.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';
import type { FillVariablesDto } from './dto/fill-variables.dto';
import type { PublishInvitationDto } from './dto/publish-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepo: Repository<Invitation>,
    @InjectRepository(InvitationVariable)
    private varRepo: Repository<InvitationVariable>,
    @InjectRepository(TemplateVariable)
    private templateVarRepo: Repository<TemplateVariable>,
    @InjectRepository(TemplateInstance)
    private instanceRepo: Repository<TemplateInstance>,
    private dataSource: DataSource,
  ) {}

  // ─── Tenant: view invitation ──────────────────────────────────────────────

  async findOne(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    return this.serializeInvitation(inv);
  }

  async findAllForTenant(tenantId: string) {
    const invitations = await this.invitationRepo
      .createQueryBuilder('inv')
      .innerJoin('inv.template', 'tpl', 'tpl.tenant_id = :tenantId', {
        tenantId,
      })
      .leftJoinAndSelect('inv.template', 'template')
      .leftJoinAndSelect('inv.templateInstance', 'templateInstance')
      .leftJoinAndSelect('inv.orderItem', 'orderItem')
      .leftJoinAndSelect('inv.variables', 'vars')
      .orderBy('inv.created_at', 'DESC')
      .getMany();

    return invitations.map((inv) => this.serializeInvitation(inv));
  }

  // ─── Guest: access via token (email link) ────────────────────────────────

  async findByToken(token: string) {
    const inv = await this.invitationRepo.findOne({
      where: { accessToken: token },
      relations: ['templateInstance', 'variables'],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    this.checkExpiry(inv);
    return this.buildRenderPayload(inv);
  }

  // ─── Public: access via slug ──────────────────────────────────────────────

  async findBySlug(slug: string) {
    const inv = await this.invitationRepo.findOne({
      where: { publicSlug: slug, isPublic: true },
      relations: ['templateInstance', 'variables'],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    this.checkExpiry(inv);

    // Increment view count (fire-and-forget)
    this.invitationRepo
      .increment({ id: inv.id }, 'viewCount', 1)
      .catch(() => null);

    return this.buildRenderPayload(inv);
  }

  // ─── Fill variables ───────────────────────────────────────────────────────

  async fillVariables(id: string, dto: FillVariablesDto, accessToken?: string) {
    const inv = await this.loadAndAuthorize(id, accessToken);

    return this.dataSource.transaction(async (em) => {
      for (const v of dto.variables) {
        const existing = await em.findOne(InvitationVariable, {
          where: { invitationId: id, variableKey: v.key },
        });
        if (existing) {
          existing.valueText = v.valueText ?? null;
          existing.valueJson = v.valueJson ?? null;
          await em.save(existing);
        } else {
          await em.save(
            em.create(InvitationVariable, {
              invitationId: id,
              variableKey: v.key,
              valueText: v.valueText ?? null,
              valueJson: v.valueJson ?? null,
            }),
          );
        }
      }

      // Check if all required variables are now filled
      const required = await this.templateVarRepo.find({
        where: { templateId: inv.templateId, required: true },
      });
      const filled = await em.find(InvitationVariable, {
        where: { invitationId: id },
      });
      const filledKeys = new Set(filled.map((f) => f.variableKey));
      const missing = required.filter((r) => !filledKeys.has(r.key));

      return {
        invitation: this.serializeInvitation({
          ...inv,
          variables: filled,
        } as Invitation),
        missingRequiredVariables: missing.map((m) => m.key),
        complete: missing.length === 0,
      };
    });
  }

  // ─── Publish (set public URL) ─────────────────────────────────────────────

  async publish(tenantId: string, id: string, dto: PublishInvitationDto) {
    const inv = await this.loadTenantInvitation(tenantId, id);

    // Validate all required vars are filled
    const required = await this.templateVarRepo.find({
      where: { templateId: inv.templateId, required: true },
    });
    const filled = await this.varRepo.find({ where: { invitationId: id } });
    const filledKeys = new Set(filled.map((f) => f.variableKey));
    const missing = required.filter((r) => !filledKeys.has(r.key));
    if (missing.length > 0) {
      throw new ConflictException(
        `Cannot publish — missing required variables: ${missing.map((m) => m.key).join(', ')}`,
      );
    }

    const slug = dto.slug ?? this.generateSlug();
    const existing = await this.invitationRepo.findOne({
      where: { publicSlug: slug },
    });
    if (existing && existing.id !== id)
      throw new ConflictException(`Slug '${slug}' already in use`);

    inv.isPublic = true;
    inv.publicSlug = slug;
    await this.invitationRepo.save(inv);

    return { url: `${slug}`, publicSlug: slug };
  }

  // ─── Unpublish ────────────────────────────────────────────────────────────

  async unpublish(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    inv.isPublic = false;
    return this.invitationRepo.save(inv);
  }

  // ─── Preview (tenant sees rendered canvas + variables) ───────────────────

  async preview(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    const instance = await this.loadTemplateInstance(inv);

    const variables = await this.varRepo.find({ where: { invitationId: id } });
    return this.renderCanvas(instance.canvasData, variables);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async loadAndAuthorize(id: string, accessToken?: string) {
    const inv = await this.invitationRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invitation not found');
    if (accessToken && inv.accessToken !== accessToken)
      throw new ForbiddenException('Invalid access token');
    this.checkExpiry(inv);
    return inv;
  }

  private async loadTenantInvitation(tenantId: string, id: string) {
    const inv = await this.invitationRepo.findOne({
      where: { id },
      relations: [
        'template',
        'template.variables',
        'templateInstance',
        'variables',
        'orderItem',
        'customer',
      ],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    if (inv.template.tenantId !== tenantId) throw new ForbiddenException();
    return inv;
  }

  private checkExpiry(inv: Invitation) {
    if (inv.expiresAt && new Date() > inv.expiresAt) {
      throw new GoneException('This invitation has expired');
    }
  }

  private async buildRenderPayload(inv: Invitation) {
    const instance = await this.loadTemplateInstance(inv);
    const rendered = this.renderCanvas(instance.canvasData, inv.variables);
    return {
      invitation: {
        ...this.serializeInvitation(inv),
        canvasData: instance.canvasData,
      },
      rendered,
    };
  }

  private async loadTemplateInstance(inv: Invitation) {
    if (!inv.templateInstanceId)
      throw new NotFoundException('Template instance not found');

    const instance =
      inv.templateInstance ??
      (await this.instanceRepo.findOne({
        where: { id: inv.templateInstanceId },
      }));

    if (!instance) throw new NotFoundException('Template instance not found');
    return instance;
  }

  private renderCanvas(
    canvasData: Record<string, unknown>,
    variables: InvitationVariable[],
  ) {
    // Replace {{variable_key}} placeholders in canvas elements with actual values
    const varMap = Object.fromEntries(
      variables.map((v) => [v.variableKey, v.valueText ?? '']),
    );
    const raw = JSON.stringify(canvasData);
    const rendered = raw.replace(
      /\{\{(\w+)\}\}/g,
      (_match, key: string) => varMap[key] ?? `{{${key}}}`,
    );
    return JSON.parse(rendered) as Record<string, unknown>;
  }

  private serializeInvitation(inv: Invitation) {
    const variableValues = Object.fromEntries(
      (inv.variables ?? []).map((variable) => [
        variable.variableKey,
        variable.valueJson ?? variable.valueText ?? '',
      ]),
    );

    return {
      id: inv.id,
      orderId: inv.orderItem?.orderId ?? inv.orderItemId,
      orderItemId: inv.orderItemId,
      templateId: inv.templateId,
      templateInstanceId: inv.templateInstanceId,
      templateTitle: inv.template?.title ?? null,
      customerName: inv.customer?.fullName ?? null,
      customerEmail: inv.customerEmail,
      accessToken: inv.accessToken,
      slug: inv.publicSlug,
      isPublic: inv.isPublic,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      canvasData: inv.templateInstance?.canvasData ?? null,
      variableDefinitions: (inv.template?.variables ?? []).map((variable) => ({
        id: variable.id,
        key: variable.key,
        label: variable.label,
        type: variable.type,
        required: variable.required,
        defaultValue: variable.defaultValue,
        placeholder: variable.placeholder,
        sortOrder: variable.sortOrder,
      })),
      variableValues,
    };
  }

  private generateSlug(): string {
    return randomUUID().slice(0, 8);
  }
}
