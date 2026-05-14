import {
  Injectable,
  NotFoundException,
  GoneException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invitation } from '../../entities/invitation.entity';
import { InvitationVariable } from '../../entities/invitation-variable.entity';
import { TemplateVariable } from '../../entities/template-variable.entity';
import { TemplateInstance } from '../../entities/template-instance.entity';
import { Template } from '../../entities/template.entity';
import { TemplateVersion } from '../../entities/template-version.entity';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Payment } from '../../entities/payment.entity';
import type { FillVariablesDto } from './dto/fill-variables.dto';
import type { PublishInvitationDto } from './dto/publish-invitation.dto';
import type { CreateAdminInvitationDto } from './dto/create-admin-invitation.dto';
import type { UpdateInvitationCanvasDto } from './dto/update-invitation-canvas.dto';
import type { UpdateInvitationMetaDto } from './dto/update-invitation-meta.dto';

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

  async findOne(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    return this.serializeInvitation(inv);
  }

  async findAllForTenant(tenantId: string) {
    const invitations = await this.invitationRepo
      .createQueryBuilder('inv')
      .innerJoinAndSelect('inv.orderItem', 'orderItem')
      .innerJoin('orderItem.order', 'order', 'order.tenant_id = :tenantId', {
        tenantId,
      })
      .leftJoinAndSelect('inv.template', 'template')
      .leftJoinAndSelect('inv.templateInstance', 'templateInstance')
      .leftJoinAndSelect('orderItem.order', 'joinedOrder')
      .leftJoinAndSelect('inv.variables', 'vars')
      .orderBy('inv.created_at', 'DESC')
      .getMany();

    return invitations.map((inv) => this.serializeInvitation(inv));
  }

  async createAdmin(tenantId: string, dto: CreateAdminInvitationDto) {
    return this.dataSource.transaction(async (em) => {
      const isFromTemplate = dto.mode === 'from_template';
      let template: Template | null = null;
      let templateVersion: TemplateVersion | null = null;

      if (isFromTemplate) {
        template = await em.findOne(Template, {
          where: { id: dto.templateId, tenantId },
        });
        if (!template) {
          throw new NotFoundException('Template not found');
        }

        if (template.status !== 'published' || !template.currentVersionId) {
          throw new BadRequestException(
            'Template must be published before creating an invitation',
          );
        }

        templateVersion = await em.findOne(TemplateVersion, {
          where: { id: template.currentVersionId },
        });
        if (!templateVersion) {
          throw new NotFoundException('Published template version not found');
        }
      }

      const subtotal = isFromTemplate ? Number(template?.price) || 0 : 0;

      const order = await em.save(
        em.create(Order, {
          tenantId,
          customerId: null,
          customerEmail: '',
          customerName: '',
          status: 'pending',
          subtotal,
          platformFee: 0,
          tenantRevenue: subtotal,
          currency: template?.currency ?? 'VND',
          paidAt: null,
        }),
      );

      const orderItem = await em.save(
        em.create(OrderItem, {
          orderId: order.id,
          templateId: template?.id ?? null,
          templateTitle: template?.title ?? 'Thiệp tuỳ chỉnh',
          unitPrice: template?.price ?? 0,
        }),
      );

      await em.save(
        em.create(Payment, {
          orderId: order.id,
          provider: 'manual',
          providerTxnId: null,
          amount: subtotal,
          currency: order.currency,
          status: 'pending',
          providerResponse: {
            source: 'admin_manual',
            mode: dto.mode,
          },
        }),
      );

      const templateInstance = await em.save(
        em.create(TemplateInstance, {
          sourceTemplateId: template?.id ?? null,
          sourceTemplateVersionId: templateVersion?.id ?? null,
          canvasData: templateVersion?.canvasData ?? {
            elements: [],
            canvasHeight: 1000,
            backgroundColor: '#ffffff',
          },
        }),
      );

      const invitation = await em.save(
        em.create(Invitation, {
          orderItemId: orderItem.id,
          templateId: template?.id ?? null,
          templateInstanceId: templateInstance.id,
          customerId: null,
          customerEmail: '',
          accessToken: randomUUID(),
          isPublic: false,
        }),
      );

      const createdInvitation = await em.findOne(Invitation, {
        where: { id: invitation.id },
        relations: [
          'template',
          'template.variables',
          'templateInstance',
          'variables',
          'orderItem',
          'orderItem.order',
          'customer',
        ],
      });

      if (!createdInvitation) {
        throw new NotFoundException('Invitation not found after creation');
      }

      return this.serializeInvitation(createdInvitation);
    });
  }

  async findByToken(token: string) {
    const inv = await this.invitationRepo.findOne({
      where: { accessToken: token },
      relations: ['templateInstance', 'variables'],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    this.checkExpiry(inv);
    return this.buildRenderPayload(inv);
  }

  async findBySlug(slug: string) {
    const inv = await this.invitationRepo.findOne({
      where: { publicSlug: slug, isPublic: true },
      relations: ['templateInstance', 'variables'],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    this.checkExpiry(inv);

    this.invitationRepo.increment({ id: inv.id }, 'viewCount', 1).catch(() => null);

    return this.buildRenderPayload(inv);
  }

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

      const required = inv.templateId
        ? await this.templateVarRepo.find({
            where: { templateId: inv.templateId, required: true },
          })
        : [];

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

  async updateMeta(
    tenantId: string,
    id: string,
    dto: UpdateInvitationMetaDto,
  ) {
    const inv = await this.loadTenantInvitation(tenantId, id);

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim() || null;
      if (slug) {
        const existing = await this.invitationRepo.findOne({
          where: { publicSlug: slug },
        });
        if (existing && existing.id !== id) {
          throw new ConflictException(`Slug '${slug}' already in use`);
        }
      }
      inv.publicSlug = slug;
    }

    await this.invitationRepo.save(inv);
    return this.serializeInvitation(inv);
  }

  async publish(tenantId: string, id: string, dto: PublishInvitationDto) {
    const inv = await this.loadTenantInvitation(tenantId, id);

    const required = inv.templateId
      ? await this.templateVarRepo.find({
          where: { templateId: inv.templateId, required: true },
        })
      : [];
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
    if (existing && existing.id !== id) {
      throw new ConflictException(`Slug '${slug}' already in use`);
    }

    inv.isPublic = true;
    inv.publicSlug = slug;
    await this.invitationRepo.save(inv);

    return { url: `${slug}`, publicSlug: slug };
  }

  async unpublish(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    inv.isPublic = false;
    return this.invitationRepo.save(inv);
  }

  async preview(tenantId: string, id: string) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    const instance = await this.loadTemplateInstance(inv);

    const variables = await this.varRepo.find({ where: { invitationId: id } });
    return this.renderCanvas(instance.canvasData, variables);
  }

  async updateCanvas(
    tenantId: string,
    id: string,
    dto: UpdateInvitationCanvasDto,
  ) {
    const inv = await this.loadTenantInvitation(tenantId, id);
    const instance = await this.loadTemplateInstance(inv);
    instance.canvasData = dto.canvasData;
    await this.instanceRepo.save(instance);
    inv.templateInstance = instance;
    return this.serializeInvitation(inv);
  }

  private async loadAndAuthorize(id: string, accessToken?: string) {
    const inv = await this.invitationRepo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException('Invitation not found');
    if (accessToken && inv.accessToken !== accessToken) {
      throw new ForbiddenException('Invalid access token');
    }
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
        'orderItem.order',
        'customer',
      ],
    });
    if (!inv) throw new NotFoundException('Invitation not found');
    if (inv.orderItem?.order?.tenantId !== tenantId) {
      throw new ForbiddenException();
    }
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
    if (!inv.templateInstanceId) {
      throw new NotFoundException('Template instance not found');
    }

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
      templateTitle: inv.template?.title ?? inv.orderItem?.templateTitle ?? null,
      customerName:
        inv.customer?.fullName ?? inv.orderItem?.order?.customerName ?? null,
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
