"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  Input,
  Empty,
  Card,
  Statistic,
  Typography,
  Breadcrumb,
  Space,
  Button,
  Avatar,
  Tag,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  RiSearchLine,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiShoppingBag3Line,
  RiUserAddLine,
  RiDownload2Line,
  RiEyeLine,
} from "@remixicon/react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerDetailDrawer } from "@/components/customers/CustomerDetailDrawer";
import type { DerivedCustomer } from "@/api/customers.api";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

function formatAmount(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<DerivedCustomer | null>(null);

  const { data: customers, isLoading } = useCustomers();

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    if (!customers) return { total: 0, totalRevenue: 0, avgSpent: 0 };
    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    return {
      total: customers.length,
      totalRevenue,
      avgSpent: customers.length ? totalRevenue / customers.length : 0,
    };
  }, [customers]);

  const columns: ColumnsType<DerivedCustomer> = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            className="bg-primary-container text-on-primary-container"
          >
            {getInitials(record.name)}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-body-sm">
              {record.name}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn hàng",
      dataIndex: "orderCount",
      align: "center",
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (val: number) => (
        <Tag variant="filled" className="rounded-full px-3">
          {val}
        </Tag>
      ),
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      align: "right",
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      defaultSortOrder: "descend",
      render: (val: number) => (
        <Text strong className="text-primary text-body-sm">
          {formatAmount(val)}
        </Text>
      ),
    },
    {
      title: "Hoạt động gần nhất",
      dataIndex: "lastOrderAt",
      render: (val: string) => (
        <Text type="secondary" className="text-body-sm">
          {new Date(val).toLocaleDateString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right" as const,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<RiEyeLine size={18} className="text-secondary" />}
              onClick={() => setSelectedCustomer(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pt-6 px-6 pb-2 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Kinh doanh" },
              { title: "Khách hàng" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Khách hàng
          </Title>
          <Text type="secondary">
            Quản lý quan hệ khách hàng và lịch sử mua hàng.
          </Text>
        </div>
        <Space>
          <Button
            icon={<RiDownload2Line size={18} />}
            className="h-12 px-6 rounded-xl"
          >
            Xuất CSV
          </Button>
          <Button
            type="primary"
            icon={<RiUserAddLine size={18} />}
            size="large"
            className="rounded-xl h-12 px-6"
          >
            Thêm khách hàng
          </Button>
        </Space>
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
                  Tổng khách hàng
                </span>
              }
              value={stats.total}
              prefix={<RiGroupLine size={20} className="mr-2 text-primary" />}
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
                  Tổng doanh thu
                </span>
              }
              value={stats.totalRevenue}
              formatter={(v) => formatAmount(Number(v))}
              prefix={
                <RiMoneyDollarCircleLine
                  size={20}
                  className="mr-2 text-primary"
                />
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
                  Chi tiêu TB
                </span>
              }
              value={stats.avgSpent}
              formatter={(v) => formatAmount(Number(v))}
              prefix={
                <RiShoppingBag3Line size={20} className="mr-2 text-primary" />
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
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={
              <RiSearchLine size={18} className="text-on-surface-variant" />
            }
            className="w-96 rounded-lg h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          rowKey="email"
          scroll={{ y: "calc(100vh - 520px)" }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            className: "mt-6",
          }}
          locale={{ 
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Chưa có khách hàng nào" 
              />
            ) 
          }}
          className="border-t border-outline-variant"
          onRow={(record) => ({
            onClick: () => setSelectedCustomer(record),
            className:
              "cursor-pointer hover:bg-surface-container-low transition-colors",
          })}
        />
      </Card>

      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}

