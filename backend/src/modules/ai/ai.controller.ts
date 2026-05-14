import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { CreateAIConfigDto } from './dto/create-config.dto';
import { GenerateTemplateDto } from './dto/generate-template.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { ExtractVariablesDto } from './dto/extract-variables.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  // ─── Configs ──────────────────────────────────────────────────────────────

  @Get('configs')
  @ApiOperation({
    summary: 'List AI provider configs for tenant (keys hidden)',
  })
  getConfigs(@CurrentTenant() tenantId: string) {
    return this.aiService.getConfigs(tenantId);
  }

  @Post('configs')
  @ApiOperation({
    summary: 'Add an AI provider config (BYOK — Business/Enterprise only)',
  })
  createConfig(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAIConfigDto,
  ) {
    return this.aiService.createConfig(tenantId, dto);
  }

  @Put('configs/:id')
  @ApiOperation({ summary: 'Update an AI config (model, key, active)' })
  updateConfig(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAIConfigDto>,
  ) {
    return this.aiService.updateConfig(tenantId, id, dto);
  }

  @Delete('configs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an AI config' })
  deleteConfig(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.aiService.deleteConfig(tenantId, id);
  }

  // ─── Generate ─────────────────────────────────────────────────────────────

  @Post('generate/template')
  @ApiOperation({ summary: 'Generate canvas_data from a text prompt' })
  generateTemplate(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateTemplateDto,
  ) {
    return this.aiService.generateTemplate(tenantId, user.id, dto);
  }

  @Post('generate/image')
  @ApiOperation({ summary: 'Generate background image from a text prompt' })
  generateImage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateImageDto,
  ) {
    return this.aiService.generateImage(tenantId, user.id, dto);
  }

  @Post('extract-variables')
  @ApiOperation({
    summary: 'Extract invitation variables from natural language text',
  })
  extractVariables(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ExtractVariablesDto,
  ) {
    return this.aiService.extractVariables(tenantId, user.id, dto);
  }

  // ─── Logs ─────────────────────────────────────────────────────────────────

  @Get('logs')
  @ApiOperation({ summary: 'AI generation history for tenant (last 100)' })
  getLogs(@CurrentTenant() tenantId: string) {
    return this.aiService.getLogs(tenantId);
  }
}
