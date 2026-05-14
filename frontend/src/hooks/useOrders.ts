import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders.api';
import type { OrderStatus } from '@/types/api';

export function useOrders(params?: {
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}
