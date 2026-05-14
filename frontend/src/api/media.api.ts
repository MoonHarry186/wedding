import { api } from '@/lib/axios';

export interface MediaFile {
  id: string;
  tenantId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  storageKey: string;
  createdAt: string;
}

export interface StockAsset {
  key: string;
  name: string;
  url: string;
}

export interface PaginatedStockAssets {
  items: StockAsset[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const mediaApi = {
  upload: (file: File, onProgress?: (percent: number) => void): Promise<MediaFile> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<MediaFile>('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      })
      .then((r) => r.data);
  },

  list: (): Promise<MediaFile[]> =>
    api.get<MediaFile[]>('/media').then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/media/${id}`).then(() => undefined),

  stockCategories: (): Promise<string[]> =>
    api.get<string[]>('/media/stock').then((r) => r.data),

  stockAssets: (category: string): Promise<StockAsset[]> =>
    api
      .get<StockAsset[]>(`/media/stock/${encodeURIComponent(category)}`)
      .then((r) => r.data),

  stockAssetsPage: (
    category: string,
    params?: { limit?: number; cursor?: string | null },
  ): Promise<PaginatedStockAssets> =>
    api
      .get<PaginatedStockAssets>(`/media/stock/${encodeURIComponent(category)}`, {
        params: {
          limit: params?.limit,
          cursor: params?.cursor ?? undefined,
        },
      })
      .then((r) => r.data),
};
