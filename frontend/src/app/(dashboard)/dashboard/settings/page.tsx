"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  App,
  Spin,
  Space,
  Typography,
  Breadcrumb,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import {
  RiStoreLine,
  RiPaletteLine,
  RiExternalLinkLine,
  RiMailLine,
  RiPhoneLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiLayoutLine,
  RiInformationLine,
} from "@remixicon/react";
import { useAuthStore } from "@/store/auth.store";
import {
  useStorefront,
  useUpdateStorefront,
  useUpdateTenant,
} from "@/hooks/useTenant";
import type {
  UpdateTenantPayload,
  UpdateStorefrontPayload,
} from "@/api/tenants.api";

const { Title, Text } = Typography;

const ColorPickerInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) => (
  <div className="flex items-center gap-3">
    <div className="relative group">
      <input
        type="color"
        value={value || "#1e1b4b"}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-12 h-12 rounded-xl border border-outline-variant cursor-pointer bg-surface overflow-hidden p-0"
      />
      <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent group-hover:border-primary/20 transition-colors" />
    </div>
    <Input
      placeholder="#1e1b4b"
      size="large"
      className="rounded-xl h-12 flex-1 font-mono"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

export default function SettingsPage() {
  const { message } = App.useApp();
  const { tenant } = useAuthStore();
  const { data: storefront, isLoading: storefrontLoading } = useStorefront();
  const updateTenant = useUpdateTenant();
  const updateStorefront = useUpdateStorefront();

  const [form] = Form.useForm();
  const watched = Form.useWatch([], form);

  const isLoading = storefrontLoading;
  const isSaving = updateTenant.isPending || updateStorefront.isPending;

  useEffect(() => {
    if (!tenant && !storefront) return;
    const socialLinks = storefront?.socialLinks ?? {};
    form.setFieldsValue({
      name: tenant?.name ?? "",
      logoUrl: tenant?.logoUrl ?? "",
      primaryColor: tenant?.primaryColor ?? "#1e1b4b",
      seoTitle: storefront?.seoTitle ?? "",
      welcomeText: storefront?.welcomeText ?? "",
      email: socialLinks["email"] ?? "",
      phone: socialLinks["phone"] ?? "",
      instagram: socialLinks["instagram"] ?? "",
      facebook: socialLinks["facebook"] ?? "",
    });
  }, [tenant, storefront, form]);

  const handleSave = async (values: Record<string, string>) => {
    const tenantPayload: UpdateTenantPayload = {
      name: values.name,
      logoUrl: values.logoUrl || undefined,
      primaryColor: values.primaryColor || undefined,
    };

    const socialLinks: Record<string, string> = {};
    if (values.email) socialLinks["email"] = values.email;
    if (values.phone) socialLinks["phone"] = values.phone;
    if (values.instagram) socialLinks["instagram"] = values.instagram;
    if (values.facebook) socialLinks["facebook"] = values.facebook;

    const storefrontPayload: UpdateStorefrontPayload = {
      seoTitle: values.seoTitle || undefined,
      welcomeText: values.welcomeText || undefined,
      socialLinks:
        Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    };

    try {
      await Promise.all([
        updateTenant.mutateAsync(tenantPayload),
        updateStorefront.mutateAsync(storefrontPayload),
      ]);
      message.success("Đã lưu cấu hình thành công");
    } catch {
      message.error("Lưu cấu hình thất bại. Vui lòng thử lại.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  const previewName = watched?.name || tenant?.name || "Tên cửa hàng";
  const previewLogo = watched?.logoUrl || tenant?.logoUrl;
  const previewColor = watched?.primaryColor || "#1e1b4b";
  const previewHeadline = watched?.seoTitle || "Tiêu đề trang chủ";
  const previewSubtitle =
    watched?.welcomeText || "Lời chào khách hàng của bạn sẽ hiển thị ở đây.";
  const previewEmail = watched?.email || "";
  const previewInstagram = watched?.instagram || "";
  const previewFacebook = watched?.facebook || "";

  return (
    <div className="pt-6 px-6 pb-2 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Cài đặt" },
              { title: "Cài đặt chung" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Cài đặt cửa hàng
          </Title>
          <Text type="secondary">
            Thiết lập nhận diện thương hiệu và thông tin cơ bản cho trang cá
            nhân của bạn.
          </Text>
        </div>
        <Space>
          <Button
            size="large"
            className="rounded-xl h-12 px-6"
            onClick={() => form.resetFields()}
            disabled={isSaving}
          >
            Hủy thay đổi
          </Button>
          <Button
            type="primary"
            size="large"
            className="rounded-xl h-12 px-10 font-semibold"
            onClick={() => form.submit()}
            loading={isSaving}
          >
            Lưu cấu hình
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            disabled={isSaving}
          >
            {/* Brand Identity */}
            <Card
              variant="outlined"
              className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
            >
              <div className="flex items-center gap-2 mb-6">
                <RiPaletteLine size={20} className="text-primary" />
                <Title level={4} className="!mb-0 !font-serif">
                  Nhận diện thương hiệu
                </Title>
              </div>

              <Row gutter={24}>
                <Col span={24} md={12}>
                  <Form.Item
                    name="name"
                    label={<Text strong>Tên cửa hàng</Text>}
                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                  >
                    <Input
                      placeholder="vd: Hoa Cưới Ánh Dương"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    name="logoUrl"
                    label={<Text strong>Logo URL</Text>}
                  >
                    <Input
                      placeholder="https://example.com/logo.png"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="primaryColor"
                    label={<Text strong>Màu thương hiệu chủ đạo</Text>}
                    className="mb-0"
                  >
                    <ColorPickerInput />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Storefront Hero */}
            <Card
              variant="outlined"
              className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant mt-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <RiLayoutLine size={20} className="text-primary" />
                <Title level={4} className="!mb-0 !font-serif">
                  Trang chủ (Storefront)
                </Title>
              </div>

              <Form.Item
                name="seoTitle"
                label={<Text strong>Tiêu đề chính (Headline)</Text>}
              >
                <Input
                  placeholder="vd: Đám cưới trong mơ của bạn"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="welcomeText"
                label={<Text strong>Đoạn giới thiệu (Subtitle)</Text>}
                className="mb-0"
              >
                <Input.TextArea
                  placeholder="Mô tả ngắn về dịch vụ của bạn..."
                  rows={3}
                  className="rounded-xl"
                />
              </Form.Item>
            </Card>

            {/* Contact & Social */}
            <Card
              variant="outlined"
              className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant mt-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <RiInformationLine size={20} className="text-primary" />
                <Title level={4} className="!mb-0 !font-serif">
                  Liên hệ & Mạng xã hội
                </Title>
              </div>

              <Row gutter={24}>
                <Col span={24} md={12}>
                  <Form.Item
                    name="email"
                    label={<Text strong>Email liên hệ</Text>}
                    rules={[{ type: "email", message: "Email không hợp lệ" }]}
                  >
                    <Input
                      prefix={
                        <RiMailLine
                          size={18}
                          className="text-on-surface-variant"
                        />
                      }
                      placeholder="contact@example.com"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    name="phone"
                    label={<Text strong>Số điện thoại</Text>}
                  >
                    <Input
                      prefix={
                        <RiPhoneLine
                          size={18}
                          className="text-on-surface-variant"
                        />
                      }
                      placeholder="+84 90 123 4567"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    name="instagram"
                    label={<Text strong>Instagram Username</Text>}
                  >
                    <Input
                      prefix={
                        <RiInstagramLine
                          size={18}
                          className="text-on-surface-variant"
                        />
                      }
                      placeholder="vd: hoacuoi.anhduong"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
                <Col span={24} md={12}>
                  <Form.Item
                    name="facebook"
                    label={<Text strong>Facebook Page ID</Text>}
                    className="mb-0"
                  >
                    <Input
                      prefix={
                        <RiFacebookCircleLine
                          size={18}
                          className="text-on-surface-variant"
                        />
                      }
                      placeholder="vd: hoacuoi.anhduong"
                      size="large"
                      className="rounded-xl h-12"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>

        {/* Preview Column */}
        <div className="hidden xl:block">
          <div className="sticky top-6">
            <Card
              variant="outlined"
              className="shadow-lg border-outline-variant overflow-hidden"
              styles={{ body: { padding: 0 } }}
            >
              {/* Browser Mockup */}
              <div className="bg-surface-container px-4 py-3 border-b border-outline-variant flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <div className="mx-auto bg-surface px-4 py-0.5 rounded-md text-[10px] text-on-surface-variant font-mono">
                  {previewName.toLowerCase().replace(/\s+/g, "-")}.cinlove.com
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-white min-h-[500px]">
                {/* Nav */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {previewLogo ? (
                      <img
                        src={previewLogo}
                        alt="logo"
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      <div
                        className="h-6 w-6 rounded bg-primary flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: previewColor }}
                      >
                        {previewName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                      {previewName}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-2 bg-gray-100 rounded-full" />
                    <div className="w-10 h-2 bg-gray-100 rounded-full" />
                  </div>
                </div>

                {/* Hero */}
                <div
                  className="px-6 py-12 text-center relative overflow-hidden"
                  style={{ backgroundColor: `${previewColor}08` }}
                >
                  <div
                    className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"
                    style={{ backgroundColor: previewColor + "10" }}
                  />
                  <h3
                    className="text-xl font-bold mb-3 leading-tight"
                    style={{ color: previewColor }}
                  >
                    {previewHeadline}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                    {previewSubtitle}
                  </p>
                  <Button
                    className="mt-6 rounded-full border-none text-white h-9 px-6 text-xs font-semibold shadow-sm"
                    style={{ backgroundColor: previewColor }}
                  >
                    Khám phá ngay
                  </Button>
                </div>

                {/* Body Mock */}
                <div className="p-6 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] bg-gray-50 rounded-lg flex items-center justify-center"
                    >
                      <RiStoreLine size={24} className="text-gray-200" />
                    </div>
                  ))}
                </div>

                {/* Footer Mock */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-3 mb-4">
                    {previewInstagram && (
                      <RiInstagramLine size={16} className="text-gray-400" />
                    )}
                    {previewFacebook && (
                      <RiFacebookCircleLine
                        size={16}
                        className="text-gray-400"
                      />
                    )}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-1/2 mb-2" />
                  <div className="h-2 bg-gray-200 rounded-full w-1/3" />
                </div>
              </div>
            </Card>
            <div className="mt-4 text-center">
              <Text
                type="secondary"
                className="text-xs italic flex items-center justify-center gap-1"
              >
                <RiExternalLinkLine size={12} /> Live preview: Cập nhật thời
                gian thực
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

