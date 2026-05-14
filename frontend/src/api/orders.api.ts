import { api as axiosInstance } from '@/lib/axios';
import type { ApiOrder, OrderStatus } from '@/types/api';

export const ordersApi = {
  list: async (params?: {
    status?: OrderStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const { data } = await axiosInstance.get<ApiOrder[]>('/orders', { params });
    return data;
  },

  get: async (id: string) => {
    const { data } = await axiosInstance.get<ApiOrder>(`/orders/${id}`);
    return data;
  },
};
