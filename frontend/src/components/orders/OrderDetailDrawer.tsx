'use client';

import React from 'react';
import { Drawer, Descriptions, Divider, Skeleton, Tag, Space } from 'antd';
import { useOrder } from '@/hooks/useOrders';
import { OrderStatusTag } from './OrderStatusTag';
import type { PaymentStatus } from '@/types/api';

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending:  'Chờ xử lý',
  success:  'Thành công',
  failed:   'Thất bại',
  refunded: 'Hoàn tiền',
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  pending:  'gold',
  success:  'success',
  failed:   'error',
  refunded: 'default',
};

interface Props {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailDrawer({ orderId, onClose }: Props) {
  const { data: order, isLoading } = useOrder(orderId ?? '');

  return (
    <Drawer
      title={order ? `Đơn hàng #${order.id.slice(0, 8).toUpperCase()}` : 'Chi tiết đơn hàng'}
      open={!!orderId}
      onClose={onClose}
      size="large"
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : order ? (
        <Space orientation="vertical" className="w-full" size="large">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Trạng thái">
              <OrderStatusTag status={order.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{order.customerName}</Descriptions.Item>
            <Descriptions.Item label="Email">{order.customerEmail}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            {order.paidAt && (
              <Descriptions.Item label="Ngày thanh toán">
                {new Date(order.paidAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div>
            <p className="text-label-caps text-on-surface-variant font-semibold uppercase mb-2">
              Sản phẩm
            </p>
            <div className="border border-outline-variant rounded-lg overflow-hidden">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-outline-variant last:border-0 bg-surface-container-lowest"
                >
                  <span className="text-body-sm text-on-surface">{item.templateTitle}</span>
                  <span className="text-body-sm font-medium text-on-surface">
                    {formatAmount(Number(item.unitPrice), order.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Descriptions column={1} size="small" bordered title="Tóm tắt thanh toán">
            <Descriptions.Item label="Tổng phụ">
              {formatAmount(Number(order.subtotal), order.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Phí nền tảng">
              {formatAmount(Number(order.platformFee), order.currency)}
            </Descriptions.Item>
            <Descriptions.Item label="Doanh thu">
              <strong>{formatAmount(Number(order.tenantRevenue), order.currency)}</strong>
            </Descriptions.Item>
          </Descriptions>

          {order.payment && (
            <Descriptions column={1} size="small" bordered title="Thanh toán">
              <Descriptions.Item label="Phương thức">
                {order.payment.provider.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={paymentStatusColor[order.payment.status]}>
                  {paymentStatusLabel[order.payment.status]}
                </Tag>
              </Descriptions.Item>
              {order.payment.providerTxnId && (
                <Descriptions.Item label="Mã giao dịch">
                  {order.payment.providerTxnId}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Space>
      ) : null}
    </Drawer>
  );
}
