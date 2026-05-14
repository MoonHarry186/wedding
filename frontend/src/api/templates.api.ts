import { api as axiosInstance } from "@/lib/axios";
import type { ApiTemplate, TemplateStatus } from "@/types/api";
import type { CanvasData } from "@/types/editor";

export const templatesApi = {
  list: async (params?: {
    category?: string;
    status?: TemplateStatus;
    search?: string;
    tenantId?: string;
  }) => {
    const { data } = await axiosInstance.get<ApiTemplate[]>("/templates", {
      params,
    });
    return data;
  },

  get: async (id: string) => {
    const { data } = await axiosInstance.get<ApiTemplate>(`/templates/${id}`);
    return data;
  },

  listCategories: async () => {
    const { data } = await axiosInstance.get("/template-categories");
    return data;
  },

  create: async (payload: {
    title?: string;
    description?: string;
    categoryId?: string;
    price?: number;
  }) => {
    const { data } = await axiosInstance.post<ApiTemplate>(
      "/templates",
      payload,
    );
    return data;
  },

  createCategory: async (payload: {
    name: string;
    slug: string;
    parentId?: string;
    iconUrl?: string;
  }) => {
    const { data } = await axiosInstance.post("/template-categories", payload);
    return data;
  },

  updateCategory: async (
    id: string,
    payload: {
      name?: string;
      slug?: string;
      parentId?: string;
      iconUrl?: string;
    },
  ) => {
    const { data } = await axiosInstance.put(
      `/template-categories/${id}`,
      payload,
    );
    return data;
  },

  deleteCategory: async (id: string) => {
    await axiosInstance.delete(`/template-categories/${id}`);
  },

  update: async (id: string, payload: Partial<ApiTemplate>) => {
    const { data } = await axiosInstance.put<ApiTemplate>(
      `/templates/${id}`,
      payload,
    );
    return data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/templates/${id}`);
  },

  publish: async (id: string, payload: { canvasData: CanvasData; changeNote?: string }) => {
    const { data } = await axiosInstance.put<ApiTemplate>(
      `/templates/${id}/publish`,
      payload,
    );
    return data;
  },
};
