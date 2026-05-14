"use client";

import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Empty,
  Progress,
  Avatar,
} from "antd";
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiSubtractLine,
  RiMagicLine,
  RiOrderPlayLine,
  RiGalleryLine,
  RiBarChartLine,
  RiMore2Line,
  RiUser3Line,
  RiVipCrownLine,
} from "@remixicon/react";
import { useAuthStore } from "@/store/auth.store";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuthStore();

  const metrics = [
    {
      title: "Doanh thu",
      value: "125.000.000đ",
      trend: "+12.5%",
      isUp: true,
      icon: <RiBarChartLine className="text-primary" />,
      color: "blue",
    },
    {
      title: "Đơn hàng",
      value: "142",
      trend: "+8.2%",
      isUp: true,
      icon: <RiOrderPlayLine className="text-primary" />,
      color: "indigo",
    },
    {
      title: "Tổng thiệp",
      value: "8.904",
      trend: "0.0%",
      isUp: null,
      icon: <RiGalleryLine className="text-primary" />,
      color: "slate",
    },
    {
      title: "Khách hàng",
      value: "1.248",
      trend: "+4%",
      isUp: true,
      icon: <RiUser3Line className="text-primary" />,
      color: "teal",
    },
  ];

  const recentOrders = [
    {
      key: "1",
      customer: "Lê Văn Tuấn",
      date: "Thứ 3, 10:45",
      amount: "2.450.000đ",
      status: "Thành công",
    },
    {
      key: "2",
      customer: "Nguyễn Thị Hà",
      date: "Thứ 3, 09:12",
      amount: "1.800.000đ",
      status: "Đang xử lý",
    },
  ];

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text: string, record: { date: string }) => (
        <Space>
          <Avatar
            icon={<RiUser3Line />}
            className="bg-surface-container-high text-primary"
          />
          <div>
            <Text strong className="block text-primary">
              {text}
            </Text>
            <Text className="text-secondary text-xs">{record.date}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      render: (text: string) => (
        <Text strong className="text-primary">
          {text}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "right" as const,
      render: (status: string) => (
        <Tag
          color={status === "Thành công" ? "success" : "warning"}
          className="rounded-full px-3 border-none"
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      {/* Welcome Section */}
      <div className="relative rounded-3xl overflow-hidden bg-primary-container p-8 md:p-12 shadow-xl border border-outline-variant/10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"
            alt="background"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/80 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="!text-white/90 font-medium block text-base">
              Chào buổi sáng,
            </span>
            <Title
              level={1}
              className="!text-white !mb-8 !font-display !text-4xl md:!text-5xl tracking-tight"
            >
              {user?.fullName || "Alexander"}
            </Title>
          </div>

          {/* Subscription Info Overlay */}
          <div className="glass-card bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 w-full md:w-80 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="!text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">
                  Gói hiện tại
                </span>
                <Title level={4} className="!text-white !m-0 !font-display">
                  Gói Pro
                </Title>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <RiVipCrownLine size={20} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs !text-white/90 mb-2 font-medium">
                  <span>Hạn mức thiệp</span>
                  <span>8.904 / 10.000</span>
                </div>
                <Progress
                  percent={89}
                  showInfo={false}
                  strokeColor="#ffffff"
                  railColor="rgba(255,255,255,0.15)"
                  size="small"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="!text-white/70 text-xs font-medium">
                  Hết hạn: 12/2024
                </span>
                <Button
                  type="link"
                  className="!text-white !p-0 !text-xs underline font-bold hover:!text-white/80"
                >
                  Nâng cấp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <Row gutter={[24, 24]}>
        {metrics.map((m, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              variant="outlined"
              className="h-full shadow-[0px_2px_4px_rgba(30,27,75,0.02)] border-outline-variant hover:shadow-lg transition-shadow rounded-2xl group"
              styles={{ body: { padding: 24 } }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center transition-colors group-hover:bg-primary-container group-hover:border-primary-container`}
                >
                  {React.cloneElement(
                    m.icon as React.ReactElement<{ className?: string }>,
                    {
                      className: `transition-colors group-hover:text-white`,
                    },
                  )}
                </div>
                {m.trend && (
                  <Tag
                    className="m-0 rounded-lg px-2 py-0.5 border-none flex items-center gap-1 font-bold"
                    color={
                      m.isUp === true
                        ? "success"
                        : m.isUp === false
                          ? "error"
                          : "default"
                    }
                  >
                    {m.isUp === true ? (
                      <RiArrowUpLine size={12} />
                    ) : m.isUp === false ? (
                      <RiArrowDownLine size={12} />
                    ) : (
                      <RiSubtractLine size={12} />
                    )}
                    {m.trend}
                  </Tag>
                )}
              </div>
              <Statistic
                title={
                  <Text className="text-secondary font-semibold tracking-wide uppercase text-[11px]">
                    {m.title}
                  </Text>
                }
                value={m.value}
                styles={{
                  content: {
                    color: "#070235",
                    fontWeight: 700,
                    fontSize: "24px",
                    letterSpacing: "-0.02em",
                  },
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Area */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            {/* Quick Actions Area */}
            <div className="bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/40">
              <div className="flex items-center justify-between mb-6">
                <Title level={4} className="!text-primary !m-0">
                  Lối tắt nhanh
                </Title>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-outline-variant rounded-2xl hover:border-primary hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <RiMagicLine size={24} />
                  </div>
                  <Text
                    strong
                    className="text-xs uppercase tracking-wider text-primary"
                  >
                    Tạo mẫu mới
                  </Text>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-outline-variant rounded-2xl hover:border-primary hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <RiOrderPlayLine size={24} />
                  </div>
                  <Text
                    strong
                    className="text-xs uppercase tracking-wider text-primary"
                  >
                    Thêm đơn hàng
                  </Text>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-primary-container rounded-2xl hover:shadow-xl transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <RiMagicLine size={24} />
                  </div>
                  <span className="text-xs uppercase tracking-wider !text-white font-bold">
                    Trợ lý AI
                  </span>
                </button>
                <button className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-outline-variant rounded-2xl hover:border-primary hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <RiBarChartLine size={24} />
                  </div>
                  <Text
                    strong
                    className="text-xs uppercase tracking-wider text-primary"
                  >
                    Báo cáo
                  </Text>
                </button>
              </div>
            </div>

            {/* Recent Orders Card */}
            <Card
              variant="outlined"
              className="shadow-[0px_4px_12px_rgba(30,27,75,0.04)] border-outline-variant rounded-2xl overflow-hidden"
              title={
                <div className="flex items-center justify-between py-2">
                  <Title level={4} className="!text-primary !m-0">
                    Đơn hàng gần đây
                  </Title>
                  <Button type="link" className="!text-primary font-bold">
                    Tất cả
                  </Button>
                </div>
              }
              styles={{ body: { padding: 0 } }}
            >
              <Table
                columns={columns}
                dataSource={recentOrders}
                pagination={false}
                className="custom-table"
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có đơn hàng nào hôm nay"
                    />
                  ),
                }}
              />
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div className="space-y-6">
            {/* Revenue Overview Placeholder Card */}
            <Card
              variant="outlined"
              className="shadow-[0px_4px_12px_rgba(30,27,75,0.04)] border-outline-variant rounded-2xl h-full"
              title={
                <div className="flex items-center justify-between py-2">
                  <Title level={4} className="!text-primary !m-0">
                    Biểu đồ doanh thu
                  </Title>
                  <RiMore2Line className="text-on-surface-variant cursor-pointer" />
                </div>
              }
            >
              <div className="h-64 flex flex-col justify-end items-stretch gap-2 px-2 pb-2 bg-surface-container-low/20 rounded-xl relative overflow-hidden">
                <div className="flex items-end justify-between gap-1 h-48 relative z-10">
                  <div className="w-full bg-primary-container/10 h-[30%] rounded-t-lg" />
                  <div className="w-full bg-primary-container/10 h-[50%] rounded-t-lg" />
                  <div className="w-full bg-primary-container/10 h-[45%] rounded-t-lg" />
                  <div className="w-full bg-primary-container/20 h-[75%] rounded-t-lg" />
                  <div className="w-full bg-primary-container/10 h-[60%] rounded-t-lg" />
                  <div className="w-full bg-primary-container/40 h-[90%] rounded-t-lg border-t-2 border-primary" />
                  <div className="w-full bg-primary-container/10 h-[70%] rounded-t-lg" />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant uppercase font-bold px-2">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                  <span>CN</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Text className="text-secondary font-medium">
                    Tổng doanh tuần
                  </Text>
                  <Text strong className="text-primary text-xl">
                    45.200k
                  </Text>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                  <RiArrowUpLine size={14} />
                  <span>+15% so với tuần trước</span>
                </div>
              </div>
            </Card>

            {/* Quick Tips or AI Helper Card */}
            <Card
              variant="outlined"
              className="shadow-[0px_4px_12px_rgba(30,27,75,0.04)] border-outline-variant rounded-2xl bg-indigo-50/50 border-indigo-100"
              styles={{ body: { padding: 24 } }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
                  <RiMagicLine size={20} />
                </div>
                <Title level={5} className="!m-0 !text-primary">
                  Trợ lý AI
                </Title>
              </div>
              <Text className="text-primary/70 block mb-4 italic text-sm leading-relaxed">
                &ldquo;Chào {user?.fullName?.split(" ")[0] || "bạn"}, bạn có 3
                đơn hàng mới cần xác nhận hôm nay. Tôi có thể giúp bạn soạn thảo
                tin nhắn cảm ơn cho khách hàng.&rdquo;
              </Text>
              <Button
                type="primary"
                block
                className="h-10 rounded-lg bg-primary-container"
              >
                Xem gợi ý
              </Button>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}

