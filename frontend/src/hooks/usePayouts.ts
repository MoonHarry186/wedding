import { useQuery } from '@tanstack/react-query';
import { payoutsApi, type PayoutStatus } from '@/api/payouts.api';

export const usePayouts = (params?: { status?: PayoutStatus }) => {
  return useQuery({
    queryKey: ['payouts', params],
    queryFn: () => payoutsApi.list(params),
  });
};

export const usePayoutDetail = (id: string) => {
  return useQuery({
    queryKey: ['payouts', id],
    queryFn: () => payoutsApi.get(id),
    enabled: !!id,
  });
};

export const usePayoutItems = (id: string) => {
  return useQuery({
    queryKey: ['payouts', id, 'items'],
    queryFn: () => payoutsApi.getItems(id),
    enabled: !!id,
  });
};
