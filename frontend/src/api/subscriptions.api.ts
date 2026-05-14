import { api } from '@/lib/axios';
import type { ApiSubscription, ApiSubscriptionPlan } from '@/types/api';

export const subscriptionsApi = {
  getPlans: () =>
    api.get<ApiSubscriptionPlan[]>('/subscriptions/plans').then((r) => r.data),

  getCurrent: () =>
    api.get<ApiSubscription>('/tenants/me/subscription').then((r) => r.data),

  checkout: (planId: string) =>
    api.post<{ checkoutUrl: string }>('/tenants/me/subscription/checkout', { planId }).then((r) => r.data),

  cancel: () =>
    api.post('/tenants/me/subscription/cancel'),

  getHistory: () =>
    api.get<{ id: string; amount: number; currency: string; status: string; createdAt: string }[]>(
      '/tenants/me/subscription/history'
    ).then((r) => r.data),
};
