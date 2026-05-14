"use client";

import React, { useState } from "react";
import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Spin,
  Table,
  Tag,
  Typography,
  Breadcrumb,
  Card,
  Space,
  Tooltip,
  Empty,
} from "antd";
import {
  RiCheckLine,
  RiTimeLine,
  RiFileCopyLine,
  RiVipCrownLine,
  RiExternalLinkLine,
  RiGlobalLine,
  RiSettings3Line,
} from "@remixicon/react";
import {
  useStorefront,
  useSetCustomDomain,
  useVerifyDomain,
} from "@/hooks/useTenant";
import { useCurrentSubscription } from "@/hooks/useSubscription";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const DNS_RECORDS = [
  { key: "a", type: "A", host: "@", value: "76.76.21.21" },
  { key: "cname", type: "CNAME", host: "www", value: "cname.cinlove.com" },
];

export default function DomainSettingsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);

  const { data: storefront, isLoading: storefrontLoading } = useStorefront();
  const { data: sub, isLoading: subLoading } = useCurrentSubscription();
  const setCustomDomain = useSetCustomDomain();
  const verifyDomain = useVerifyDomain();

  const [form] = Form.useForm<{ domain: string }>();
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const isLoading = storefrontLoading || subLoading;
  const planAllows = sub?.plan?.customDomain ?? false;
  const slug = tenant?.slug ?? "your-store";
  const customDomain = storefront?.customDomain ?? "";
  const domainVerified = storefront?.domainVerified ?? false;

  const handleAddDomain = async (values: { domain: string }) => {
    try {
      await setCustomDomain.mutateAsync(values.domain.trim());
      message.success("Domain đã được thêm thành công.");
      form.resetFields();
    } catch {
      message.error("Không thể thêm domain. Vui lòng thử lại.");
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyDomain.mutateAsync();
      setVerifyResult(result.verified);
      result.verified
        ? message.success("Domain đã được xác minh thành công!")
        : message.warning(
            "Chưa tìm thấy bản ghi DNS. Vui lòng kiểm tra lại cấu hình.",
          );
    } catch {
      message.error("Xác minh thất bại. Vui lòng thử lại.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Đã sao chép!");
    } catch {
      message.error("Không thể sao chép.");
    }
  };

  const dnsColumns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (v: string) => (
        <Tag color="blue" variant="filled" className="font-mono font-bold px-3">
          {v}
        </Tag>
      ),
    },
    {
      title: "Host",
      dataIndex: "host",
      key: "host",
      width: 100,
      render: (v: string) => (
        <Text strong className="font-mono text-sm">
          {v}
        </Text>
      ),
    },
    {
      title: "Giá trị bản ghi",
      dataIndex: "value",
      key: "value",
      render: (v: string) => (
        <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50">
          <Text className="font-mono text-sm text-primary flex-1">{v}</Text>
          <Tooltip title="Sao chép">
            <Button
              type="text"
              size="small"
              icon={<RiFileCopyLine size={16} className="text-secondary" />}
              onClick={() => copyToClipboard(v)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  if (isLoading) {
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
              { title: "Tên miền" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Quản lý Tên miền
          </Title>
          <Text type="secondary">
            Thiết lập cách khách hàng truy cập vào trang cá nhân của bạn qua
            Cinlove hoặc tên miền riêng.
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Default subdomain */}
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <div className="flex items-center gap-2 mb-6">
              <RiGlobalLine size={20} className="text-primary" />
              <Title level={4} className="!mb-0 !font-serif">
                Subdomain mặc định
              </Title>
            </div>

            <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <RiCheckLine size={24} />
                </div>
                <div>
                  <Title level={5} className="!mb-0 font-mono">
                    {slug}.cinlove.com
                  </Title>
                  <Text type="secondary" className="text-xs">
                    Luôn hoạt động và bảo mật (SSL)
                  </Text>
                </div>
              </div>
              <Button
                type="primary"
                href={`https://${slug}.cinlove.com`}
                target="_blank"
                icon={<RiExternalLinkLine size={18} />}
                className="rounded-xl h-10 px-4"
              >
                Truy cập
              </Button>
            </div>
          </Card>

          {/* Custom Domain Section */}
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <div className="flex items-center gap-2 mb-6">
              <RiSettings3Line size={20} className="text-primary" />
              <Title level={4} className="!mb-0 !font-serif">
                Tên miền riêng (Custom Domain)
              </Title>
            </div>

            {!planAllows ? (
              <div className="py-8 px-6 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <RiVipCrownLine size={32} />
                </div>
                <div className="max-w-md">
                  <Title level={5}>Yêu cầu nâng cấp gói</Title>
                  <Text type="secondary">
                    Tính năng kết nối tên miền riêng chỉ dành cho các gói Premium. Nâng cấp ngay để khẳng định thương hiệu chuyên nghiệp của bạn.
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<RiVipCrownLine size={18} />}
                  className="rounded-xl h-12 px-8"
                  onClick={() => router.push("/dashboard/settings/subscription")}
                >
                  Nâng cấp gói dịch vụ
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Current Domain Status */}
                {customDomain && (
                  <div className="p-5 rounded-2xl bg-surface border border-outline-variant space-y-4">
                    <div className="flex justify-between items-start">
                      <Space orientation="vertical" size={0}>
                        <Text className="text-label-caps text-secondary uppercase">
                          Domain đang kết nối
                        </Text>
                        <Title level={4} className="!mb-0 font-mono">
                          {customDomain}
                        </Title>
                      </Space>
                      {domainVerified ? (
                        <Tag color="success" variant="filled" className="rounded-full px-4">
                          Đã xác minh
                        </Tag>
                      ) : (
                        <Tag color="warning" variant="filled" className="rounded-full px-4">
                          Đang chờ xác minh
                        </Tag>
                      )}
                    </div>

                    {!domainVerified && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                        <RiTimeLine size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <Text strong className="text-amber-900 block">Yêu cầu xác minh DNS</Text>
                          <Text className="text-amber-700 text-xs">Vui lòng cập nhật các bản ghi DNS bên dưới và nhấn nút xác minh kết nối.</Text>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Add/Edit Form */}
                <div className="space-y-4">
                  <Text strong>{customDomain ? "Thay đổi tên miền" : "Thêm tên miền mới"}</Text>
                  <Form
                    form={form}
                    onFinish={handleAddDomain}
                    layout="vertical"
                  >
                    <div className="flex gap-3">
                      <Form.Item
                        name="domain"
                        className="flex-1 !mb-0"
                        rules={[
                          { required: true, message: "Vui lòng nhập domain" },
                          {
                            pattern: /^(?!https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                            message: "Domain không hợp lệ (vd: rsvp.brand.com)",
                          },
                        ]}
                      >
                        <Input
                          placeholder="vd: rsvp.thuonghieucuaban.com"
                          size="large"
                          className="rounded-xl h-12 font-mono"
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={setCustomDomain.isPending}
                        className="rounded-xl h-12 px-6 font-semibold"
                      >
                        {customDomain ? "Cập nhật" : "Kết nối ngay"}
                      </Button>
                    </div>
                    <Text type="secondary" className="text-[11px] mt-2 block">
                      Lưu ý: Bạn cần sở hữu tên miền này trước khi thực hiện kết nối.
                    </Text>
                  </Form>
                </div>

                {/* DNS Table */}
                {customDomain && (
                  <div className="space-y-4">
                    <Divider />
                    <div className="flex justify-between items-center">
                      <Title level={5} className="!mb-0">Cấu hình DNS yêu cầu</Title>
                      <Button
                        type="primary"
                        ghost
                        onClick={handleVerify}
                        loading={verifyDomain.isPending}
                        className="rounded-lg"
                      >
                        Xác minh kết nối
                      </Button>
                    </div>
                    <Table
                      dataSource={DNS_RECORDS}
                      columns={dnsColumns}
                      pagination={false}
                      className="border border-outline-variant rounded-xl overflow-hidden"
                      locale={{ 
                        emptyText: (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="Không có bản ghi DNS" 
                          />
                        ) 
                      }}
                    />
                    {verifyResult !== null && !verifyResult && (
                      <Text type="danger" className="text-xs italic text-center block">
                        Cảnh báo: Chúng tôi chưa tìm thấy các bản ghi DNS này. Quá trình cập nhật DNS có thể mất đến 24h.
                      </Text>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card
            variant="outlined"
            className="bg-primary/5 border-primary/10 shadow-sm"
          >
            <Title level={5} className="!mb-4 !font-serif">Hướng dẫn kết nối</Title>
            <ul className="space-y-4 list-none p-0">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">1</div>
                <Text type="secondary" className="text-xs">Mua tên miền tại các nhà cung cấp như Godaddy, Namecheap...</Text>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">2</div>
                <Text type="secondary" className="text-xs">Thêm bản ghi A hoặc CNAME như bảng DNS bên cạnh.</Text>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0">3</div>
                <Text type="secondary" className="text-xs">Quay lại đây và nhấn xác minh để hoàn tất.</Text>
              </li>
            </ul>
          </Card>

          <Card
            variant="outlined"
            className="border-outline-variant shadow-sm"
          >
            <Title level={5} className="!mb-2 !font-serif">SSL Tự động</Title>
            <Text type="secondary" className="text-xs leading-relaxed block">
              Cinlove tự động cung cấp chứng chỉ bảo mật SSL (HTTPS) cho mọi tên miền kết nối thành công mà không tính thêm phí.
            </Text>
          </Card>
        </div>
      </div>
    </div>
  );
}
