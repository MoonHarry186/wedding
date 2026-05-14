import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { MediaFile } from '../../entities/media-file.entity';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const PRESIGN_TTL = 60 * 60 * 24 * 7; // 7 ngày
const DEFAULT_STOCK_PAGE_SIZE = 30;

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;
  private publicDomain: string | undefined;

  constructor(
    @InjectRepository(MediaFile) private mediaRepo: Repository<MediaFile>,
  ) {
    const accountId = process.env.R2_ACCOUNT_ID;
    this.bucket = process.env.R2_BUCKET || 'zenlove-uploads';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: accountId
        ? `https://${accountId}.r2.cloudflarestorage.com`
        : process.env.S3_ENDPOINT, // fallback MinIO cho local dev
      forcePathStyle: !accountId && !!process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY || '',
      },
    });
  }

  private async resolveUrl(storageKey: string): Promise<string> {
    if (this.publicDomain) {
      return `${this.publicDomain.replace(/\/$/, '')}/${storageKey}`;
    }
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      { expiresIn: PRESIGN_TTL },
    );
  }

  private async withUrl(
    media: MediaFile,
  ): Promise<MediaFile & { url: string }> {
    const url = await this.resolveUrl(media.storageKey);
    return { ...media, url };
  }

  async upload(
    file: Express.Multer.File,
    tenantId: string,
    userId: string,
  ): Promise<MediaFile & { url: string }> {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type '${file.mimetype}' not allowed. Use: jpeg, png, webp, gif`,
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('File exceeds 10 MB limit');
    }

    const ext = file.originalname.split('.').pop() ?? 'bin';
    const storageKey = `tenants/${tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: storageKey,
        Body: Readable.from(file.buffer),
        ContentType: file.mimetype,
        ContentLength: file.size,
      },
    }).done();

    const media = this.mediaRepo.create({
      tenantId,
      uploadedBy: userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: storageKey, // lưu key, không lưu URL trực tiếp
      storageKey,
    });
    const saved = await this.mediaRepo.save(media);
    return this.withUrl(saved);
  }

  async findAll(tenantId: string): Promise<Array<MediaFile & { url: string }>> {
    const files = await this.mediaRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(files.map((f) => this.withUrl(f)));
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id, tenantId } });
    if (!media) throw new NotFoundException('File not found');

    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: media.storageKey }),
    );
    await this.mediaRepo.remove(media);
  }

  async listStockCategories(): Promise<string[]> {
    const result = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'resources/',
        Delimiter: '/',
      }),
    );
    return (result.CommonPrefixes ?? [])
      .map((p) => p.Prefix?.replace('resources/', '').replace(/\/$/, '') ?? '')
      .filter(Boolean);
  }

  async listStockAssets(
    category: string,
    options?: { limit?: number; cursor?: string },
  ): Promise<
    | Array<{ key: string; name: string; url: string }>
    | {
        items: Array<{ key: string; name: string; url: string }>;
        nextCursor: string | null;
        hasMore: boolean;
      }
  > {
    const prefix = `resources/${category}/`;
    const hasPagination =
      typeof options?.limit === 'number' || typeof options?.cursor === 'string';

    if (!hasPagination) {
      const result = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix }),
      );
      const items = (result.Contents ?? []).filter((obj) => obj.Key !== prefix);
      return Promise.all(
        items.map(async (obj) => ({
          key: obj.Key!,
          name: obj.Key!.split('/').pop() ?? obj.Key!,
          url: await this.resolveUrl(obj.Key!),
        })),
      );
    }

    const requestedLimit = options?.limit;
    const limit =
      typeof requestedLimit === 'number' && Number.isFinite(requestedLimit)
        ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
        : DEFAULT_STOCK_PAGE_SIZE;

    const result = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: limit,
        ContinuationToken: options?.cursor,
      }),
    );
    const items = (result.Contents ?? []).filter((obj) => obj.Key !== prefix);
    const mappedItems = await Promise.all(
      items.map(async (obj) => ({
        key: obj.Key!,
        name: obj.Key!.split('/').pop() ?? obj.Key!,
        url: await this.resolveUrl(obj.Key!),
      })),
    );

    return {
      items: mappedItems,
      nextCursor: result.NextContinuationToken ?? null,
      hasMore: Boolean(result.IsTruncated && result.NextContinuationToken),
    };
  }
}
