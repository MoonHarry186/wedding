'use client';

import React from 'react';
import { Drawer, Table, Skeleton, Empty } from 'antd';
import { useCustomerOrders } from '@/hooks/useCustomers';
import { OrderStatusTag } from '@/components/orders/OrderStatusTag';
import type { DerivedCustomer } from '@/api/customers.api';
import type { ApiOrder } from '@/types/api';
import type { ColumnsType } from 'antd/es/table';

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

const columns: ColumnsType<ApiOrder> = [
  {
    title: 'Đơn hàng',
    dataIndex: 'id',
    render: (id: string) => (
      <span className="font-medium text-body-sm">#{id.slice(0, 8).toUpperCase()}</span>
    ),
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'subtotal',
    render: (val: number, record: ApiOrder) => formatAmount(Number(val), record.currency),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (status) => <OrderStatusTag status={status} />,
  },
  {
    title: 'Ngày đặt',
    dataIndex: 'createdAt',
    render: (val: string) => new Date(val).toLocaleDateString('vi-VN'),
  },
];

interface Props {
  customer: DerivedCustomer | null;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, onClose }: Props) {
  const { data: orders, isLoading } = useCustomerOrders(customer?.email ?? '');

  return (
    <Drawer
      title={customer?.name ?? 'Lịch sử đơn hàng'}
      open={!!customer}
      onClose={onClose}
      size="large"
    >
      {customer && (
        <div className="space-y-4">
          <div className="bg-surface-container-low rounded-lg p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase text-xs font-semibold">Email</p>
              <p className="text-body-sm text-on-surface mt-1">{customer.email}</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase text-xs font-semibold">Đơn hàng</p>
              <p className="text-body-sm text-on-surface mt-1">{customer.orderCount}</p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase text-xs font-semibold">Tổng chi tiêu</p>
              <p className="text-body-sm font-medium text-primary mt-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-label-caps text-on-surface-variant uppercase text-xs font-semibold">Lần đầu đặt</p>
              <p className="text-body-sm text-on-surface mt-1">
                {new Date(customer.firstOrderAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-label-caps text-on-surface-variant uppercase text-xs font-semibold mb-2">
              Lịch sử đơn hàng
            </p>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Table
                columns={columns}
                dataSource={orders ?? []}
                rowKey="id"
                size="small"
                pagination={false}
                locale={{ 
                  emptyText: (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      description="Chưa có đơn hàng nào" 
                    />
                  ) 
                }}
              />
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
