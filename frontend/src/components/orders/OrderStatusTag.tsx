import { Tag } from 'antd';
import type { OrderStatus } from '@/types/api';

const config: Record<OrderStatus, { color: string; label: string }> = {
  pending:  { color: 'gold',    label: 'Chờ thanh toán' },
  paid:     { color: 'success', label: 'Đã thanh toán' },
  failed:   { color: 'error',   label: 'Thất bại' },
  refunded: { color: 'default', label: 'Hoàn tiền' },
};

export function OrderStatusTag({ status }: { status: OrderStatus }) {
  const { color, label } = config[status] ?? { color: 'default', label: status };
  return <Tag color={color}>{label}</Tag>;
}
