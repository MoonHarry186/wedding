'use client';

import React from 'react';
import { Skeleton, Button, Tag, Descriptions, Space } from 'antd';
import { RiArrowLeftLine, RiMailLine } from '@remixicon/react';
import { useRouter, useParams } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { OrderStatusTag } from '@/components/orders/OrderStatusTag';
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

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto text-center py-20">
        <p className="text-on-surface-variant">Không tìm thấy đơn hàng.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/orders')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary transition-colors mb-3"
          >
            <RiArrowLeftLine size={16} />
            Quay lại đơn hàng
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h1 font-h1 text-on-surface">
              Đơn #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <OrderStatusTag status={order.status} />
          </div>
          <p className="text-body-md text-on-surface-variant">
            Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <Space>
          <Button icon={<RiMailLine size={16} />} type="primary">
            Gửi lại email
          </Button>
        </Space>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — items + payment history */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order items */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0px_2px_4px_rgba(30,27,75,0.04)]">
            <h2 className="text-h3 font-h3 text-on-surface mb-4 pb-4 border-b border-outline-variant">
              Sản phẩm
            </h2>
            <div className="flex flex-col gap-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">{item.templateTitle}</p>
                    <p className="text-body-sm text-on-surface-variant">Template ID: {item.templateId.slice(0, 8)}</p>
                  </div>
                  <span className="text-body-md font-medium text-on-surface">
                    {formatAmount(Number(item.unitPrice), order.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment timeline */}
          {order.payment && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0px_2px_4px_rgba(30,27,75,0.04)]">
              <h2 className="text-h3 font-h3 text-on-surface mb-4 pb-4 border-b border-outline-variant">
                Lịch sử thanh toán
              </h2>
              <div className="relative pl-4 border-l-2 border-outline-variant ml-2 space-y-6">
                {order.paidAt && (
                  <div className="relative">
                    <div className="absolute -left-[23px] bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                    <p className="text-body-sm text-on-surface-variant mb-1">
                      {new Date(order.paidAt).toLocaleString('vi-VN')}
                    </p>
                    <p className="text-body-md text-on-surface">
                      Thanh toán <strong>{formatAmount(Number(order.payment.amount), order.currency)}</strong> qua{' '}
                      {order.payment.provider.toUpperCase()} thành công.
                    </p>
                  </div>
                )}
                <div className="relative">
                  <div className="absolute -left-[23px] bg-primary w-3 h-3 rounded-full border-2 border-white" />
                  <p className="text-body-sm text-on-surface-variant mb-1">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-body-md text-on-surface">Đơn hàng được tạo bởi khách hàng.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — customer + summary */}
        <div className="flex flex-col gap-6">
          {/* Customer */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0px_2px_4px_rgba(30,27,75,0.04)]">
            <h2 className="text-h3 font-h3 text-on-surface mb-4 pb-4 border-b border-outline-variant">
              Khách hàng
            </h2>
            <Descriptions column={1} size="small" colon={false} className="[&_.ant-descriptions-item-label]:text-on-surface-variant [&_.ant-descriptions-item-label]:text-xs [&_.ant-descriptions-item-label]:uppercase [&_.ant-descriptions-item-label]:font-semibold">
              <Descriptions.Item label="Tên">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="Email">
                <a href={`mailto:${order.customerEmail}`} className="text-primary hover:underline">
                  {order.customerEmail}
                </a>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0px_2px_4px_rgba(30,27,75,0.04)]">
            <h2 className="text-h3 font-h3 text-on-surface mb-4 pb-4 border-b border-outline-variant">
              Tóm tắt
            </h2>
            <div className="space-y-3 text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tổng phụ</span>
                <span>{formatAmount(Number(order.subtotal), order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Phí nền tảng</span>
                <span>- {formatAmount(Number(order.platformFee), order.currency)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-outline-variant font-medium">
                <span>Doanh thu của bạn</span>
                <span className="text-primary">
                  {formatAmount(Number(order.tenantRevenue), order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          {order.payment && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-[0px_2px_4px_rgba(30,27,75,0.04)]">
              <h2 className="text-h3 font-h3 text-on-surface mb-4 pb-4 border-b border-outline-variant">
                Thanh toán
              </h2>
              <div className="space-y-3 text-body-md">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Phương thức</span>
                  <span className="uppercase font-medium">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Trạng thái</span>
                  <Tag color={paymentStatusColor[order.payment.status]}>
                    {paymentStatusLabel[order.payment.status]}
                  </Tag>
                </div>
                {order.payment.providerTxnId && (
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Mã GD</span>
                    <span className="text-xs font-mono">{order.payment.providerTxnId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
