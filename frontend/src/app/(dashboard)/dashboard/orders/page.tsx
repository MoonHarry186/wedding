"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Empty,
  Typography,
  Breadcrumb,
  Card,
  Statistic,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  RiSearchLine,
  RiDownload2Line,
  RiEyeLine,
  RiShoppingBag3Line,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiFilter3Line,
} from "@remixicon/react";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatusTag } from "@/components/orders/OrderStatusTag";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import type { ApiOrder, OrderStatus } from "@/types/api";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(
    amount,
  );
}

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Hoàn tiền" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders, isLoading } = useOrders();

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.id.toLowerCase().includes(q) &&
          !o.customerName.toLowerCase().includes(q) &&
          !o.customerEmail.toLowerCase().includes(q)
        )
          return false;
      }
      if (dateRange?.[0] && new Date(o.createdAt) < dateRange[0].toDate())
        return false;
      if (dateRange?.[1] && new Date(o.createdAt) > dateRange[1].toDate())
        return false;
      return true;
    });
  }, [orders, search, status, dateRange]);

  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, revenue: 0 };
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      revenue: orders
        .filter((o) => o.status === "paid")
        .reduce((s, o) => s + Number(o.subtotal), 0),
    };
  }, [orders]);

  const columns: ColumnsType<ApiOrder> = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Text strong className="font-mono text-xs text-primary">
          #{id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-body-sm">
            {record.customerName}
          </Text>
          <Text type="secondary" className="text-[11px]">
            {record.customerEmail}
          </Text>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "templates",
      render: (_, record) => (
        <Text className="text-body-sm">
          {record.items?.map((i) => i.templateTitle).join(", ") || "—"}
        </Text>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (
        <Text type="secondary" className="text-body-sm">
          {new Date(val).toLocaleDateString("vi-VN")}
        </Text>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Tổng tiền",
      dataIndex: "subtotal",
      align: "right",
      render: (val: number, record) => (
        <Text strong className="text-on-surface">
          {formatAmount(Number(val), record.currency)}
        </Text>
      ),
      sorter: (a, b) => Number(a.subtotal) - Number(b.subtotal),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <OrderStatusTag status={s} />,
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right" as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem nhanh">
            <Button
              type="text"
              icon={<RiEyeLine size={18} className="text-secondary" />}
              onClick={() => setSelectedOrderId(record.id)}
            />
          </Tooltip>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/dashboard/orders/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Kinh doanh" },
              { title: "Đơn hàng" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Đơn hàng
          </Title>
          <Text type="secondary">
            Quản lý và theo dõi các đơn hàng thiệp cưới.
          </Text>
        </div>
        <Button
          icon={<RiDownload2Line size={18} />}
          size="large"
          className="h-12 px-6 rounded-xl"
        >
          Xuất danh sách
        </Button>
      </div>

      {/* Stats Overview */}
      <Row gutter={24}>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Tổng đơn hàng
                </span>
              }
              value={stats.total}
              prefix={
                <RiShoppingBag3Line size={20} className="mr-2 text-primary" />
              }
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Chờ thanh toán
                </span>
              }
              value={stats.pending}
              prefix={<RiTimeLine size={20} className="mr-2 text-amber-500" />}
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Doanh thu thực nhận
                </span>
              }
              value={stats.revenue}
              formatter={(v) => formatAmount(Number(v), "VND")}
              prefix={
                <RiCheckboxCircleLine
                  size={20}
                  className="mr-2 text-green-500"
                />
              }
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Bar & Table */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
      >
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm mã đơn, tên hoặc email..."
              prefix={
                <RiSearchLine size={18} className="text-on-surface-variant" />
              }
              className="w-80 rounded-lg h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Select
              value={status}
              onChange={(v) => setStatus(v as OrderStatus | "")}
              options={STATUS_OPTIONS}
              className="w-48 h-10"
            />
            <RangePicker
              onChange={(val) =>
                setDateRange(val as [Dayjs | null, Dayjs | null] | null)
              }
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              className="h-10 rounded-lg"
            />
          </Space>
          <RiFilter3Line
            size={20}
            className="text-on-surface-variant cursor-pointer"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: "mt-6",
          }}
          className="border-t border-outline-variant"
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có đơn hàng nào" 
              />
            ) 
          }}
        />
      </Card>

      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}

