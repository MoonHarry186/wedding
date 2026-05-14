import { ordersApi } from './orders.api';

export interface DerivedCustomer {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

export const customersApi = {
  list: async (): Promise<DerivedCustomer[]> => {
    const orders = await ordersApi.list();
    const map = new Map<string, DerivedCustomer>();
    for (const order of orders) {
      const key = order.customerEmail;
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += Number(order.subtotal);
        if (order.createdAt < existing.firstOrderAt) existing.firstOrderAt = order.createdAt;
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
      } else {
        map.set(key, {
          email: order.customerEmail,
          name: order.customerName,
          orderCount: 1,
          totalSpent: Number(order.subtotal),
          firstOrderAt: order.createdAt,
          lastOrderAt: order.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
    );
  },

  getOrders: async (email: string) => {
    const orders = await ordersApi.list();
    return orders.filter((o) => o.customerEmail === email);
  },
};
