import { api as axiosInstance } from "@/lib/axios";
import type { ApiInvitation } from "@/types/api";

export const invitationsApi = {
  list: async (params?: {
    templateId?: string;
    search?: string;
    tenantId?: string;
  }) => {
    const { data } = await axiosInstance.get<ApiInvitation[]>("/invitations", {
      params,
    });
    return data;
  },

  get: async (id: string) => {
    const { data } = await axiosInstance.get<ApiInvitation>(`/invitations/${id}`);
    return data;
  },

  getBySlug: async (slug: string, token?: string) => {
    const { data } = await axiosInstance.get<{ invitation: ApiInvitation }>(`/w/${slug}`, {
      params: { token },
    });
    return data.invitation;
  },

  fillVariables: async (
    id: string,
    payload: {
      variables: Array<{
        key: string;
        valueText?: string;
        valueJson?: Record<string, unknown>;
      }>;
    },
  ) => {
    const { data } = await axiosInstance.put(`/invitations/${id}/variables`, payload);
    return data;
  },

  publish: async (id: string, payload?: { slug?: string }) => {
    const { data } = await axiosInstance.put(`/invitations/${id}/publish`, payload || {});
    return data;
  },

  unpublish: async (id: string) => {
    const { data } = await axiosInstance.put(`/invitations/${id}/unpublish`);
    return data;
  },
};
