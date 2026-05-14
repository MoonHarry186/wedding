import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions.api';

export const SUB_KEYS = {
  plans: ['subscriptions', 'plans'] as const,
  current: ['subscriptions', 'current'] as const,
  history: ['subscriptions', 'history'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: SUB_KEYS.plans,
    queryFn: subscriptionsApi.getPlans,
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: SUB_KEYS.current,
    queryFn: subscriptionsApi.getCurrent,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (planId: string) => subscriptionsApi.checkout(planId),
    onSuccess: (data) => {
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    },
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: SUB_KEYS.current }),
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: SUB_KEYS.history,
    queryFn: subscriptionsApi.getHistory,
  });
}
