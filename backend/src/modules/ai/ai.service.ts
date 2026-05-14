import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantAIConfig } from '../../entities/tenant-ai-config.entity';
import { AIGenerationLog } from '../../entities/ai-generation-log.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Subscription } from '../../entities/subscription.entity';
import { encrypt, decrypt } from '../../common/crypto/encryption';
import { CanvasDataSchema } from './canvas.schema';
import { callAnthropic } from './providers/anthropic.provider';
import { callOpenAI, generateImageOpenAI } from './providers/openai.provider';
import type { CreateAIConfigDto } from './dto/create-config.dto';
import type { GenerateTemplateDto } from './dto/generate-template.dto';
import type { GenerateImageDto } from './dto/generate-image.dto';
import type { ExtractVariablesDto } from './dto/extract-variables.dto';

const TEMPLATE_GEN_SYSTEM = `You are an expert wedding invitation designer.
Return ONLY valid JSON matching this exact schema — no markdown, no explanation:
{
  "width": number,
  "height": number,
  "background": "#hexcolor",
  "elements": [
    {
      "id": "unique-string",
      "type": "text",
      "x": number, "y": number,
      "content": "text or {{variable_key}}",
      "fontSize": number,
      "color": "#hexcolor",
      "fontWeight": "400" | "700",
      "italic": boolean,
      "textAlign": "left" | "center" | "right",
      "letterSpacing": number,
      "width": number
    }
  ]
}
Use {{variable_key}} placeholders for dynamic content (bride_name, groom_name, wedding_date, venue, etc.).
Ensure coordinates fit within the canvas width/height. Create a beautiful, realistic layout.`;

const VARIABLE_EXTRACT_SYSTEM = `Extract invitation variables from the given text.
Return ONLY a JSON array like:
[
  { "key": "bride_name", "label": "Tên cô dâu", "type": "text", "required": true },
  { "key": "wedding_date", "label": "Ngày cưới", "type": "date", "required": true }
]
Valid types: text | date | image | number | color.
Use snake_case keys. Return [] if no variables found.`;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @InjectRepository(TenantAIConfig)
    private configRepo: Repository<TenantAIConfig>,
    @InjectRepository(AIGenerationLog)
    private logRepo: Repository<AIGenerationLog>,
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
  ) {}

  // ─── Config CRUD ──────────────────────────────────────────────────────────

  async getConfigs(tenantId: string) {
    const configs = await this.configRepo.find({ where: { tenantId } });
    // Never expose the encrypted key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return configs.map(({ apiKeyEnc: _k, ...c }) => c);
  }

  async createConfig(tenantId: string, dto: CreateAIConfigDto) {
    await this.assertByokAllowed(tenantId);

    const existing = await this.configRepo.findOne({
      where: { tenantId, feature: dto.feature, provider: dto.provider },
    });
    if (existing)
      throw new ConflictException(
        'Config for this feature+provider already exists — use PUT to update',
      );

    const apiKeyEnc = encrypt(dto.apiKey);
    const config = this.configRepo.create({
      tenantId,
      feature: dto.feature,
      provider: dto.provider,
      model: dto.model,
      apiKeyEnc,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.configRepo.save(config);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKeyEnc: _k, ...safe } = saved;
    return safe;
  }

  async updateConfig(
    tenantId: string,
    id: string,
    dto: Partial<CreateAIConfigDto>,
  ) {
    await this.assertByokAllowed(tenantId);
    const config = await this.configRepo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException('Config not found');

    if (dto.model) config.model = dto.model;
    if (dto.isActive !== undefined) config.isActive = dto.isActive;
    if (dto.apiKey) config.apiKeyEnc = encrypt(dto.apiKey);

    const saved = await this.configRepo.save(config);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKeyEnc: _k, ...safe } = saved;
    return safe;
  }

  async deleteConfig(tenantId: string, id: string) {
    const config = await this.configRepo.findOne({ where: { id, tenantId } });
    if (!config) throw new NotFoundException('Config not found');
    await this.configRepo.remove(config);
  }

  // ─── Generate template ────────────────────────────────────────────────────

  async generateTemplate(
    tenantId: string,
    userId: string,
    dto: GenerateTemplateDto,
  ) {
    const { config, apiKey } = await this.resolveConfig(
      tenantId,
      'template_gen',
    );

    const width = dto.width ?? 800;
    const height = dto.height ?? 600;
    const userMessage = `Create a wedding invitation canvas. Width: ${width}px, Height: ${height}px.\n\nDesign brief: ${dto.prompt}`;

    let result: Awaited<ReturnType<typeof callAnthropic>>;
    let status: 'success' | 'failed' = 'success';
    let canvasData: Record<string, unknown> | null = null;

    try {
      result = await this.callProvider(
        config.provider,
        apiKey,
        config.model,
        TEMPLATE_GEN_SYSTEM,
        userMessage,
      );

      // Extract JSON from response (handle possible markdown code blocks)
      const jsonStr = this.extractJson(result.text);
      const parsed = CanvasDataSchema.safeParse(JSON.parse(jsonStr));

      if (!parsed.success) {
        throw new BadRequestException(
          `AI returned invalid canvas schema: ${parsed.error.message}`,
        );
      }
      canvasData = parsed.data;
    } catch (err) {
      status = 'failed';
      await this.writeLog({
        tenantId,
        userId,
        config,
        feature: 'template_gen',
        prompt: userMessage,
        status: 'failed',
      });
      throw err;
    }

    await this.writeLog({
      tenantId,
      userId,
      config,
      feature: 'template_gen',
      prompt: userMessage,
      status,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd: result.costUsd,
    });

    return {
      canvasData,
      usage: {
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        costUsd: result.costUsd,
      },
    };
  }

  // ─── Generate image ───────────────────────────────────────────────────────

  async generateImage(tenantId: string, userId: string, dto: GenerateImageDto) {
    const { config, apiKey } = await this.resolveConfig(tenantId, 'image_gen');

    if (config.provider !== 'openai') {
      throw new BadRequestException(
        'Image generation currently supports OpenAI (DALL-E) only',
      );
    }

    let imageUrl: string;
    try {
      const result = await generateImageOpenAI(
        apiKey,
        config.model,
        dto.prompt,
      );
      imageUrl = result.url;
    } catch (err) {
      await this.writeLog({
        tenantId,
        userId,
        config,
        feature: 'image_gen',
        prompt: dto.prompt,
        status: 'failed',
      });
      throw err;
    }

    await this.writeLog({
      tenantId,
      userId,
      config,
      feature: 'image_gen',
      prompt: dto.prompt,
      status: 'success',
    });
    return { url: imageUrl };
  }

  // ─── Extract variables from text ─────────────────────────────────────────

  async extractVariables(
    tenantId: string,
    userId: string,
    dto: ExtractVariablesDto,
  ) {
    const { config, apiKey } = await this.resolveConfig(
      tenantId,
      'variable_extract',
    );

    let result: Awaited<ReturnType<typeof callAnthropic>>;
    try {
      result = await this.callProvider(
        config.provider,
        apiKey,
        config.model,
        VARIABLE_EXTRACT_SYSTEM,
        dto.text,
      );
    } catch (err) {
      await this.writeLog({
        tenantId,
        userId,
        config,
        feature: 'variable_extract',
        prompt: dto.text,
        status: 'failed',
      });
      throw err;
    }

    let variables: unknown[] = [];
    try {
      variables = JSON.parse(this.extractJson(result.text)) as unknown[];
    } catch {
      variables = [];
    }

    await this.writeLog({
      tenantId,
      userId,
      config,
      feature: 'variable_extract',
      prompt: dto.text,
      status: 'success',
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costUsd: result.costUsd,
    });

    return {
      variables,
      usage: {
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        costUsd: result.costUsd,
      },
    };
  }

  // ─── Logs ─────────────────────────────────────────────────────────────────

  getLogs(tenantId: string) {
    return this.logRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async resolveConfig(tenantId: string, feature: string) {
    const config = await this.configRepo.findOne({
      where: { tenantId, feature: feature as never, isActive: true },
    });

    // Fallback to Cinlove platform key
    if (!config) {
      const defaultKey = process.env.ANTHROPIC_API_KEY;
      if (!defaultKey)
        throw new BadRequestException(
          `No AI config found for feature '${feature}'. Add your own API key or contact support.`,
        );

      return {
        config: {
          id: null as string | null,
          provider: 'anthropic' as const,
          model: 'claude-sonnet-4-6',
          feature,
        },
        apiKey: defaultKey,
      };
    }

    return { config, apiKey: decrypt(config.apiKeyEnc) };
  }

  private async callProvider(
    provider: string,
    apiKey: string,
    model: string,
    system: string,
    user: string,
  ) {
    if (provider === 'anthropic')
      return callAnthropic(apiKey, model, system, user);
    if (provider === 'openai') return callOpenAI(apiKey, model, system, user);
    throw new BadRequestException(
      `Provider '${provider}' is not supported yet`,
    );
  }

  private extractJson(text: string): string {
    // Strip markdown code fences if present
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return match[1].trim();
    // Find first { or [ to strip any leading text
    const start = text.search(/[{[]/);
    return start >= 0 ? text.slice(start) : text;
  }

  private async writeLog(params: {
    tenantId: string;
    userId: string;
    config: {
      id: string | null;
      provider: string;
      model: string;
      feature: string;
    };
    feature: string;
    prompt: string;
    status: 'success' | 'failed' | 'rejected';
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
    resultId?: string;
  }) {
    await this.logRepo.save(
      this.logRepo.create({
        tenantId: params.tenantId,
        userId: params.userId,
        configId: params.config.id,
        feature: params.feature,
        prompt: params.prompt.slice(0, 2000),
        provider: params.config.provider,
        model: params.config.model,
        tokensInput: params.tokensInput ?? 0,
        tokensOutput: params.tokensOutput ?? 0,
        costUsd: params.costUsd ?? 0,
        status: params.status,
        resultId: params.resultId ?? null,
      }),
    );
  }

  private async assertByokAllowed(tenantId: string) {
    const sub = await this.subRepo.findOne({
      where: { tenantId, status: 'active' },
      relations: ['plan'],
    });
    if (!sub?.plan?.aiBYOK) {
      throw new ForbiddenException(
        'Your plan does not support custom AI keys. Upgrade to Business or Enterprise.',
      );
    }
  }
}
