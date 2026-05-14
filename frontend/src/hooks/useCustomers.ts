import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.list,
  });
}

export function useCustomerOrders(email: string) {
  return useQuery({
    queryKey: ['customer-orders', email],
    queryFn: () => customersApi.getOrders(email),
    enabled: !!email,
  });
}
