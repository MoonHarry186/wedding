import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Template } from '../../entities/template.entity';
import { TemplateVersion } from '../../entities/template-version.entity';
import { TemplateVariable } from '../../entities/template-variable.entity';
import { TemplateCategory } from '../../entities/template-category.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { CreateTemplateDto } from './dto/create-template.dto';
import type { UpdateTemplateDto } from './dto/update-template.dto';
import type { PublishTemplateDto } from './dto/publish-template.dto';
import type { CreateVariableDto } from './dto/create-variable.dto';
import type { UpdateVariableDto } from './dto/update-variable.dto';
import type { CreateCategoryDto } from './dto/create-category.dto';
import {
  extractTemplateVariables,
  TemplateVariableExtractionError,
} from './utils/extract-template-variables';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template) private templateRepo: Repository<Template>,
    @InjectRepository(TemplateVersion)
    private versionRepo: Repository<TemplateVersion>,
    @InjectRepository(TemplateVariable)
    private variableRepo: Repository<TemplateVariable>,
    @InjectRepository(TemplateCategory)
    private categoryRepo: Repository<TemplateCategory>,
    private subscriptionsService: SubscriptionsService,
    private dataSource: DataSource,
  ) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  getCategories() {
    return this.categoryRepo.find({
      relations: ['children'],
      where: { parentId: IsNull() },
    });
  }

  private getDefaultTemplateTitle() {
    return 'Mẫu thiệp mới';
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.categoryRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing)
      throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async removeCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(category);
  }

  // ─── Templates ────────────────────────────────────────────────────────────

  findAll(tenantId: string, filters: { status?: string; categoryId?: string }) {
    const qb = this.templateRepo
      .createQueryBuilder('t')
      .where('t.tenant_id = :tenantId', { tenantId })
      .leftJoinAndSelect('t.category', 'category')
      .orderBy('t.created_at', 'DESC');

    if (filters.status === 'published') {
      qb.andWhere('t.status = :status', { status: 'published' });
    } else if (filters.status === 'private') {
      qb.andWhere('t.status <> :status', { status: 'published' });
    }
    if (filters.categoryId)
      qb.andWhere('t.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });

    return qb.getMany();
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.templateRepo.findOne({
      where: { id, tenantId },
      relations: ['category', 'variables'],
    });
    if (!template) throw new NotFoundException('Template not found');

    // Attach canvasData from the current published version
    if (template.currentVersionId) {
      const version = await this.versionRepo.findOne({
        where: { id: template.currentVersionId },
      });
      (template as unknown as Record<string, unknown>).canvasData =
        version?.canvasData ?? null;
    } else {
      (template as unknown as Record<string, unknown>).canvasData = null;
    }

    return template;
  }

  async create(tenantId: string, userId: string, dto: CreateTemplateDto) {
    // Check subscription limit
    const plan = await this.subscriptionsService.getPlanForTenant(tenantId);
    if (plan?.maxTemplates !== null && plan?.maxTemplates !== undefined) {
      const count = await this.templateRepo.count({
        where: { tenantId, status: 'published' },
      });
      if (count >= plan.maxTemplates) {
        throw new ForbiddenException(
          `Plan '${plan.name}' allows max ${plan.maxTemplates} published templates. Upgrade to publish more.`,
        );
      }
    }

    const title = dto.title?.trim() || this.getDefaultTemplateTitle();

    const template = this.templateRepo.create({
      tenantId,
      createdBy: userId,
      title,
      description: dto.description ?? null,
      categoryId: dto.categoryId ?? null,
      price: dto.price ?? 0,
      currency: dto.currency ?? 'VND',
      status: 'private',
    });
    return this.templateRepo.save(template);
  }

  async update(tenantId: string, id: string, dto: UpdateTemplateDto) {
    const template = await this.findOne(tenantId, id);
    if (dto.status === 'published' && !template.currentVersionId) {
      throw new BadRequestException(
        'Cannot mark template as published before publishing a version',
      );
    }

    Object.assign(template, dto);
    if (dto.status === 'published' && !template.publishedAt) {
      template.publishedAt = new Date();
    }
    return this.templateRepo.save(template);
  }

  async remove(tenantId: string, id: string) {
    const template = await this.findOne(tenantId, id);
    if (template.status === 'published' && template.purchaseCount > 0) {
      throw new BadRequestException(
        'Cannot delete a template that has been purchased — archive it instead',
      );
    }
    await this.templateRepo.remove(template);
  }

  // ─── Publish — creates a new version ──────────────────────────────────────

  async publish(
    tenantId: string,
    id: string,
    userId: string,
    dto: PublishTemplateDto,
  ) {
    return this.dataSource.transaction(async (em) => {
      const template = await em.findOne(Template, { where: { id, tenantId } });
      if (!template) throw new NotFoundException('Template not found');

      let extractedVariables;
      try {
        extractedVariables = extractTemplateVariables(dto.canvasData);
      } catch (error) {
        if (error instanceof TemplateVariableExtractionError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      const lastVersion = await em.findOne(TemplateVersion, {
        where: { templateId: id },
        order: { versionNumber: 'DESC' },
      });
      const nextVersion = (lastVersion?.versionNumber ?? 0) + 1;

      const version = em.create(TemplateVersion, {
        templateId: id,
        savedBy: userId,
        versionNumber: nextVersion,
        canvasData: dto.canvasData,
        changeNote: dto.changeNote ?? null,
      });
      const savedVersion = await em.save(version);

      template.currentVersionId = savedVersion.id;
      template.status = 'published';
      if (!template.publishedAt) template.publishedAt = new Date();
      await em.save(template);

      await em.delete(TemplateVariable, { templateId: id });

      if (extractedVariables.length > 0) {
        await em.save(
          TemplateVariable,
          extractedVariables.map((variable) =>
            em.create(TemplateVariable, {
              templateId: id,
              ...variable,
            }),
          ),
        );
      }

      return { template, version: savedVersion };
    });
  }

  // ─── Versions ─────────────────────────────────────────────────────────────

  getVersions(tenantId: string, templateId: string) {
    return this.versionRepo.find({
      where: { templateId },
      order: { versionNumber: 'DESC' },
      relations: ['savedByUser'],
    });
  }

  // ─── Variables ────────────────────────────────────────────────────────────

  async getVariables(tenantId: string, templateId: string) {
    await this.findOne(tenantId, templateId);
    return this.variableRepo.find({
      where: { templateId },
      order: { sortOrder: 'ASC' },
    });
  }

  async createVariable(
    tenantId: string,
    templateId: string,
    dto: CreateVariableDto,
  ) {
    const template = await this.findOne(tenantId, templateId);

    const existing = await this.variableRepo.findOne({
      where: { templateId, key: dto.key },
    });
    if (existing)
      throw new ConflictException(`Variable key '${dto.key}' already exists`);

    const variable = this.variableRepo.create({ templateId, ...dto });
    return this.variableRepo.save(variable);
  }

  async updateVariable(
    tenantId: string,
    templateId: string,
    varId: string,
    dto: UpdateVariableDto,
  ) {
    await this.findOne(tenantId, templateId);
    const variable = await this.variableRepo.findOne({
      where: { id: varId, templateId },
    });
    if (!variable) throw new NotFoundException('Variable not found');
    Object.assign(variable, dto);
    return this.variableRepo.save(variable);
  }

  async removeVariable(tenantId: string, templateId: string, varId: string) {
    await this.findOne(tenantId, templateId);
    const variable = await this.variableRepo.findOne({
      where: { id: varId, templateId },
    });
    if (!variable) throw new NotFoundException('Variable not found');
    await this.variableRepo.remove(variable);
  }
}
