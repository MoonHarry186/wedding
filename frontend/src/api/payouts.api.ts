import { api as axios } from '@/lib/axios';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface ApiPayout {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod: string;
  payoutAccount: string;
  referenceId: string;
  notes: string;
  processedAt: string | null;
  createdAt: string;
}

export interface ApiPayoutItem {
  id: string;
  payoutId: string;
  orderId: string;
  orderAmount: number;
  commission: number;
  netAmount: number;
  createdAt: string;
}

export const payoutsApi = {
  list: (params?: { status?: PayoutStatus }) => 
    axios.get<ApiPayout[]>('/payouts', { params }).then(res => res.data),
  
  get: (id: string) => 
    axios.get<ApiPayout>(`/payouts/${id}`).then(res => res.data),
  
  getItems: (id: string) => 
    axios.get<ApiPayoutItem[]>(`/payouts/${id}/items`).then(res => res.data),
};
