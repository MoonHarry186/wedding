"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Typography,
  Breadcrumb,
  Space,
  Card,
  Input,
  Select,
  Empty,
} from "antd";
import {
  RiSearchLine,
  RiFileList3Line,
  RiEyeLine,
  RiBankCardLine,
  RiCalendarLine,
} from "@remixicon/react";
import { usePayouts } from "@/hooks/usePayouts";
import { PayoutStatusTag } from "@/components/payouts/PayoutStatusTag";
import { PayoutDetailDrawer } from "@/components/payouts/PayoutDetailDrawer";
import type { PayoutStatus, ApiPayout } from "@/api/payouts.api";

const { Title, Text } = Typography;

export default function PayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | undefined>();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  const { data: payouts, isLoading } = usePayouts({ status: statusFilter });

  const columns = [
    {
      title: "Mã thanh toán",
      dataIndex: "id",
      key: "id",
      render: (v: string) => (
        <Space>
          <RiFileList3Line size={16} className="text-primary/60" />
          <Text strong className="font-mono text-xs">
            #{v.slice(0, 8).toUpperCase()}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <Text type="secondary" className="text-xs">
          {new Date(v).toLocaleDateString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => (
        <Text strong className="text-primary">
          {v.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "payoutMethod",
      key: "payoutMethod",
      render: (v: string) => (
        <Space size={4}>
          <RiBankCardLine size={14} className="text-on-surface-variant" />
          <Text className="text-xs">{v}</Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: PayoutStatus) => <PayoutStatusTag status={v} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, record: ApiPayout) => (
        <Button
          type="text"
          icon={<RiEyeLine size={18} />}
          onClick={() => setSelectedPayoutId(record.id)}
          className="hover:bg-indigo-50 hover:text-primary transition-all"
        />
      ),
    },
  ];

  return (
    <div className="pt-6 px-6 pb-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Thanh toán (Payouts)" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Lịch sử Thanh toán
          </Title>
          <Text type="secondary">
            Theo dõi các đợt thanh toán doanh thu từ hệ thống về tài khoản của bạn.
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
        styles={{ body: { padding: "16px 24px" } }}
      >
        <Space wrap size="middle">
          <Input
            placeholder="Tìm mã thanh toán..."
            prefix={<RiSearchLine size={18} className="text-on-surface-variant" />}
            className="w-80 rounded-lg h-10"
            allowClear
          />
          <Select
            placeholder="Tất cả trạng thái"
            className="w-48 h-10"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Đang chờ", value: "pending" },
              { label: "Đang xử lý", value: "processing" },
              { label: "Đã thanh toán", value: "paid" },
              { label: "Thất bại", value: "failed" },
            ]}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={Array.isArray(payouts) ? payouts : []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          className="payouts-table"
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có lịch sử thanh toán nào" 
              />
            ) 
          }}
          scroll={{ y: "calc(100vh - 440px)" }}
        />
      </Card>

      <PayoutDetailDrawer
        payoutId={selectedPayoutId}
        onClose={() => setSelectedPayoutId(null)}
      />

      <style jsx global>{`
        .payouts-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          color: #64748b !important;
          padding: 16px 24px !important;
        }
        .payouts-table .ant-table-tbody > tr > td {
          padding: 16px 24px !important;
        }
        .payouts-table .ant-table-row:hover > td {
          background: #f5f3ff !important;
        }
      `}</style>
    </div>
  );
}
