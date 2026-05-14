"use client";

import React from "react";
import {
  Button,
  Tag,
  Progress,
  Table,
  Spin,
  App,
  Typography,
  Breadcrumb,
  Card,
  Row,
  Col,
  Space,
  Empty,
} from "antd";
import {
  RiCheckLine,
  RiCloseLine,
  RiVipCrownLine,
  RiHistoryLine,
  RiWallet3Line,
} from "@remixicon/react";
import {
  usePlans,
  useCurrentSubscription,
  useCheckout,
  useSubscriptionHistory,
} from "@/hooks/useSubscription";
import type { ApiSubscriptionPlan } from "@/types/api";

const { Title, Text } = Typography;

const STATUS_LABEL: Record<string, string> = {
  active: "Đang hoạt động",
  cancelled: "Đã hủy",
  past_due: "Quá hạn",
  trialing: "Dùng thử",
};

const STATUS_COLOR: Record<string, string> = {
  active: "success",
  cancelled: "default",
  past_due: "error",
  trialing: "processing",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

interface PlanFeature {
  label: string;
  enabled: boolean;
}

function planFeatures(plan: ApiSubscriptionPlan): PlanFeature[] {
  return [
    {
      label:
        plan.maxTemplates == null
          ? "Templates không giới hạn"
          : `${plan.maxTemplates} templates`,
      enabled: true,
    },
    {
      label:
        plan.maxMembers == null
          ? "Thành viên không giới hạn"
          : `${plan.maxMembers} thành viên`,
      enabled: true,
    },
    { label: "Custom domain", enabled: plan.customDomain },
    { label: "Analytics nâng cao", enabled: plan.analytics },
    { label: "Niêm yết Marketplace", enabled: plan.marketplaceListing },
    { label: "Tích hợp AI (BYOK)", enabled: plan.aiBYOK },
  ];
}

export default function SubscriptionPage() {
  const { message } = App.useApp();
  const { data: sub, isLoading: subLoading } = useCurrentSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: history, isLoading: histLoading } = useSubscriptionHistory();
  const checkout = useCheckout();

  const handleCheckout = async (planId: string) => {
    try {
      await checkout.mutateAsync(planId);
    } catch {
      message.error("Không thể xử lý thanh toán. Vui lòng thử lại.");
    }
  };

  const sortedPlans = [...(plans ?? [])].sort(
    (a, b) => a.priceMonthly - b.priceMonthly,
  );

  const historyColumns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
      render: (v: string) => (
        <Text strong className="font-mono text-xs">
          {v.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => (
        <Text type="secondary" className="text-body-sm">
          {formatDate(v)}
        </Text>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (v: number) => (
        <Text strong className="text-on-surface">
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color="success" variant="filled" className="rounded-full px-3 text-[11px]">
          {v === "paid" ? "Thành công" : v}
        </Tag>
      ),
    },
  ];

  if (subLoading || plansLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="pt-6 px-6 pb-2 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Cài đặt" },
              { title: "Gói dịch vụ" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Gói dịch vụ & Thanh toán
          </Title>
          <Text type="secondary">
            Nâng cấp gói để mở khóa nhiều tính năng cao cấp cho cửa hàng của bạn.
          </Text>
        </div>
      </div>

      {/* Current plan + payment method */}
      {sub && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Current plan detail */}
          <Card
            variant="outlined"
            className="lg:col-span-3 shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <Space orientation="vertical" size={0}>
                    <Text className="text-label-caps text-secondary uppercase">
                      Gói hiện tại
                    </Text>
                    <Title level={3} className="!mb-0 !font-serif text-primary">
                      {sub.plan.name}
                    </Title>
                  </Space>
                  <Tag
                    color={STATUS_COLOR[sub.status]}
                    variant="filled"
                    className="rounded-full px-4 py-0.5 text-xs font-semibold"
                  >
                    {STATUS_LABEL[sub.status]}
                  </Tag>
                </div>

                <div className="flex items-baseline gap-2">
                  <Text className="text-2xl font-bold text-on-surface">
                    {sub.plan.priceMonthly === 0
                      ? "Miễn phí"
                      : formatCurrency(sub.plan.priceMonthly)}
                  </Text>
                  {sub.plan.priceMonthly > 0 && (
                    <Text type="secondary">/tháng</Text>
                  )}
                </div>

                {sub.currentPeriodEnd && (
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <RiVipCrownLine size={16} className="text-amber-500" />
                    <span>Hạn dùng đến ngày: {formatDate(sub.currentPeriodEnd)}</span>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 space-y-6 border-l border-outline-variant pl-0 md:pl-8 pt-6 md:pt-0">
                <Text className="text-label-caps text-secondary uppercase block mb-4">
                  Sử dụng tài nguyên
                </Text>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <Text type="secondary">Mẫu thiệp</Text>
                      <Text strong>
                        — / {sub.plan.maxTemplates ?? "∞"}
                      </Text>
                    </div>
                    <Progress
                      percent={0}
                      showInfo={false}
                      strokeColor="#1e1b4b"
                      railColor="#f1f5f9"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <Text type="secondary">Thành viên</Text>
                      <Text strong>
                        — / {sub.plan.maxMembers ?? "∞"}
                      </Text>
                    </div>
                    <Progress
                      percent={0}
                      showInfo={false}
                      strokeColor="#1e1b4b"
                      railColor="#f1f5f9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method Quick Look */}
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant bg-surface-container-low flex flex-col justify-center items-center text-center"
          >
            <RiWallet3Line size={32} className="text-primary mb-3" />
            <Text className="text-label-caps text-secondary uppercase block mb-1">
              Thanh toán
            </Text>
            {sub.provider === "free" ? (
              <Text type="secondary" className="text-xs">
                Gói miễn phí<br />không cần thẻ
              </Text>
            ) : (
              <Text strong className="capitalize">
                {sub.provider}
              </Text>
            )}
          </Card>
        </div>
      )}

      {/* Pricing cards */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <RiVipCrownLine size={20} className="text-primary" />
          <Title level={4} className="!mb-0 !font-serif">
            Các gói dịch vụ khả dụng
          </Title>
        </div>
        
        <Row gutter={24}>
          {sortedPlans.map((plan) => {
            const isCurrent = sub?.planId === plan.id;
            const isUpgrade = sub
              ? plan.priceMonthly > (sub.plan.priceMonthly ?? 0)
              : false;
            const features = planFeatures(plan);

            return (
              <Col key={plan.id} xs={24} md={8}>
                <Card
                  variant="outlined"
                  className={`relative h-full transition-all duration-300 ${
                    isCurrent
                      ? "border-primary border-2 shadow-lg scale-[1.02] z-10"
                      : "border-outline-variant hover:border-primary/50"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                      Gói hiện tại
                    </div>
                  )}
                  
                  <div className="space-y-6 flex flex-col h-full">
                    <div>
                      <Title level={4} className="!mb-1">{plan.name}</Title>
                      <div className="flex items-baseline gap-1 mt-2">
                        <Text className="text-3xl font-bold text-on-surface">
                          {plan.priceMonthly === 0
                            ? "Miễn phí"
                            : formatCurrency(plan.priceMonthly)}
                        </Text>
                        {plan.priceMonthly > 0 && (
                          <Text type="secondary">/tháng</Text>
                        )}
                      </div>
                    </div>

                    <ul className="flex-1 space-y-3">
                      {features.map((f) => (
                        <li key={f.label} className="flex items-start gap-3 text-body-sm">
                          {f.enabled ? (
                            <RiCheckLine
                              size={18}
                              className="text-green-500 shrink-0"
                            />
                          ) : (
                            <RiCloseLine
                              size={18}
                              className="text-on-surface-variant/40 shrink-0"
                            />
                          )}
                          <Text className={f.enabled ? "" : "text-on-surface-variant/60"}>
                            {f.label}
                          </Text>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type={isCurrent ? "default" : isUpgrade ? "primary" : "default"}
                      disabled={isCurrent}
                      loading={checkout.isPending}
                      onClick={() => !isCurrent && handleCheckout(plan.id)}
                      block
                      size="large"
                      className={`rounded-xl h-12 font-semibold ${isCurrent ? 'bg-surface-container' : ''}`}
                    >
                      {isCurrent
                        ? "Đang sử dụng"
                        : isUpgrade
                        ? "Nâng cấp ngay"
                        : "Hạ cấp gói"}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Billing history */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <RiHistoryLine size={20} className="text-primary" />
          <Title level={4} className="!mb-0 !font-serif">
            Lịch sử giao dịch
          </Title>
        </div>
        
        <Card
          variant="outlined"
          className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant overflow-hidden"
        >
          <Table
            dataSource={history ?? []}
            columns={historyColumns}
            rowKey="id"
            loading={histLoading}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            className="border-t border-outline-variant"
            locale={{ 
              emptyText: (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="Chưa có lịch sử thanh toán" 
                />
              ) 
            }}
          />
        </Card>
      </div>
    </div>
  );
}
