import { api as axios } from '@/lib/axios';

export interface AIConfig {
  id: string;
  provider: 'openai' | 'anthropic' | 'google';
  model: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface AIUsageLog {
  id: string;
  action: string;
  prompt: string;
  tokens: number;
  cost: number;
  status: 'success' | 'failed';
  createdAt: string;
}

export interface GenerateTemplatePayload {
  prompt: string;
  categoryId?: string;
}

export interface GenerateImagePayload {
  prompt: string;
  aspectRatio?: '1:1' | '4:5' | '9:16';
}

export const aiApi = {
  // Configs
  getConfigs: () => axios.get<AIConfig[]>('/ai/configs').then(res => res.data),
  createConfig: (payload: Partial<AIConfig>) => axios.post<AIConfig>('/ai/configs', payload).then(res => res.data),
  deleteConfig: (id: string) => axios.delete(`/ai/configs/${id}`),
  toggleConfig: (id: string) => axios.patch<AIConfig>(`/ai/configs/${id}/toggle`).then(res => res.data),

  // Generation
  generateTemplate: (payload: GenerateTemplatePayload) =>
    axios.post<{ canvasData: Record<string, unknown>; title: string }>('/ai/generate/template', payload).then(res => res.data),
  
  generateImage: (payload: GenerateImagePayload) => 
    axios.post<{ url: string }>('/ai/generate/image', payload).then(res => res.data),
  
  extractVariables: (text: string) => 
    axios.post<{ variables: string[] }>('/ai/extract-variables', { text }).then(res => res.data),

  // Logs
  getLogs: () => axios.get<AIUsageLog[]>('/ai/logs').then(res => res.data),
};
