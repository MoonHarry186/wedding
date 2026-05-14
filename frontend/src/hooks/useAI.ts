import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi, type GenerateTemplatePayload, type GenerateImagePayload } from '@/api/ai.api';

export const useAIConfigs = () => {
  return useQuery({
    queryKey: ['ai-configs'],
    queryFn: () => aiApi.getConfigs(),
  });
};

export const useCreateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
    },
  });
};

export const useDeleteAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: aiApi.deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
    },
  });
};

export const useGenerateTemplate = () => {
  return useMutation({
    mutationFn: (payload: GenerateTemplatePayload) => aiApi.generateTemplate(payload),
  });
};

export const useGenerateImage = () => {
  return useMutation({
    mutationFn: (payload: GenerateImagePayload) => aiApi.generateImage(payload),
  });
};

export const useExtractVariables = () => {
  return useMutation({
    mutationFn: (text: string) => aiApi.extractVariables(text),
  });
};

export const useAIUsageLogs = () => {
  return useQuery({
    queryKey: ['ai-usage-logs'],
    queryFn: () => aiApi.getLogs(),
  });
};
