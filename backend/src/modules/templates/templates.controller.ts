import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { PublishTemplateDto } from './dto/publish-template.dto';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('templates')
@Controller()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  // ─── Categories ──────────────────────────────────────────────────────────

  @Public()
  @Get('template-categories')
  @ApiOperation({ summary: 'List template categories (tree)' })
  getCategories() {
    return this.templatesService.getCategories();
  }

  @ApiBearerAuth()
  @Post('template-categories')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create a category (admin only)' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.templatesService.createCategory(dto);
  }

  @ApiBearerAuth()
  @Put('template-categories/:id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update a category' })
  updateCategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    return this.templatesService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @Delete('template-categories/:id')
  @Roles('owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category' })
  removeCategory(@Param('id') id: string) {
    return this.templatesService.removeCategory(id);
  }

  // ─── Templates ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('templates')
  @ApiOperation({ summary: 'List templates for current tenant' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['private', 'published'],
  })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.templatesService.findAll(tenantId, { status, categoryId });
  }

  @ApiBearerAuth()
  @Post('templates')
  @ApiOperation({ summary: 'Create a new template' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, user.id, dto);
  }

  @ApiBearerAuth()
  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template detail' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.templatesService.findOne(tenantId, id);
  }

  @ApiBearerAuth()
  @Put('templates/:id')
  @ApiOperation({ summary: 'Update template metadata' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @ApiBearerAuth()
  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template (only if 0 purchases)' })
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.templatesService.remove(tenantId, id);
  }

  @ApiBearerAuth()
  @Put('templates/:id/publish')
  @ApiOperation({
    summary: 'Publish template — saves a new version with canvas_data',
  })
  publish(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: PublishTemplateDto,
  ) {
    return this.templatesService.publish(tenantId, id, user.id, dto);
  }

  @ApiBearerAuth()
  @Get('templates/:id/versions')
  @ApiOperation({ summary: 'List version history of a template' })
  getVersions(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.templatesService.getVersions(tenantId, id);
  }

  // ─── Variables ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('templates/:id/variables')
  @ApiOperation({ summary: 'List variables of a template' })
  getVariables(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.templatesService.getVariables(tenantId, id);
  }

  @ApiBearerAuth()
  @Post('templates/:id/variables')
  @ApiOperation({ summary: 'Add a variable to a template' })
  createVariable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateVariableDto,
  ) {
    return this.templatesService.createVariable(tenantId, id, dto);
  }

  @ApiBearerAuth()
  @Put('templates/:id/variables/:varId')
  @ApiOperation({ summary: 'Update a variable' })
  updateVariable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('varId') varId: string,
    @Body() dto: UpdateVariableDto,
  ) {
    return this.templatesService.updateVariable(tenantId, id, varId, dto);
  }

  @ApiBearerAuth()
  @Delete('templates/:id/variables/:varId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a variable' })
  removeVariable(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('varId') varId: string,
  ) {
    return this.templatesService.removeVariable(tenantId, id, varId);
  }
}
