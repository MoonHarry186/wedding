"use client";

import React, { useState } from "react";
import {
  App,
  Button,
  Input,
  Select,
  Empty,
  Spin,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  Breadcrumb,
  Space,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  RiSearchLine,
  RiAddLine,
  RiEditLine,
  RiFileCopyLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiShoppingBag3Line,
  RiSettings3Line,
  RiLayoutLine,
  RiPaletteLine,
  RiFlashlightLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import {
  useTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useTemplateCategories,
} from "@/hooks/useTemplates";
import { useAuthStore } from "@/store/auth.store";
import type { ApiTemplateCategory, TemplateStatus } from "@/types/api";

const { Title, Text } = Typography;

const STATUS_TAG: Record<TemplateStatus, { color: string; label: string }> = {
  private: { color: "default", label: "Riêng tư" },
  published: { color: "success", label: "Đang bán" },
};

function getTemplateStatusMeta(status: string | null | undefined) {
  if (status === "published") {
    return STATUS_TAG.published;
  }

  return STATUS_TAG.private;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();

  const { tenant } = useAuthStore();
  const { data: templates, isLoading } = useTemplates({
    search,
    category,
    tenantId: tenant?.id,
  });
  const { data: categories } = useTemplateCategories();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreate = async () => {
    try {
      const template = await createTemplate.mutateAsync({});
      message.success("Đã tạo template mới");
      router.push(`/editor/${template.id}`);
    } catch {
      message.error("Không thể tạo template. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      message.success("Đã xóa template");
    } catch {
      message.error("Không thể xóa template");
    }
  };

  const categoryOptions =
    categories?.map((c: ApiTemplateCategory) => ({ value: c.id, label: c.name })) || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Mẫu thiệp" },
              { title: "Danh sách" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Danh sách Mẫu thiệp
          </Title>
          <Text type="secondary">
            Quản lý và thiết kế các mẫu thiệp mời của bạn.
          </Text>
        </div>
        <Space>
          <Button
            icon={<RiSettings3Line size={18} />}
            className="h-12 px-6 rounded-xl"
            onClick={() => router.push("/dashboard/templates/categories")}
          >
            Quản lý danh mục
          </Button>
          <Button
            type="primary"
            icon={<RiAddLine size={18} />}
            size="large"
            className="rounded-xl h-12 px-6"
            loading={createTemplate.isPending}
            onClick={handleCreate}
          >
            Tạo mới
          </Button>
        </Space>
      </div>

      {/* Stats Overview (Optional but adds premium feel) */}
      <Row gutter={24}>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Tổng mẫu thiệp
                </span>
              }
              value={templates?.length || 0}
              prefix={<RiLayoutLine size={20} className="mr-2 text-primary" />}
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
                  Đang bán
                </span>
              }
              value={
                templates?.filter((t) => t.status === "published").length || 0
              }
              prefix={
                <RiFlashlightLine size={20} className="mr-2 text-green-500" />
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
                  Tổng lượt xem
                </span>
              }
              value={
                templates?.reduce((s, t) => s + (t.viewCount || 0), 0) || 0
              }
              prefix={<RiEyeLine size={20} className="mr-2 text-primary" />}
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
      >
        <Space wrap size="middle">
          <Input
            placeholder="Tìm kiếm mẫu thiệp..."
            prefix={
              <RiSearchLine size={18} className="text-on-surface-variant" />
            }
            className="w-80 rounded-lg h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Tất cả danh mục"
            className="w-56 h-10"
            allowClear
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
        </Space>
      </Card>

      {/* Grid */}
      <Spin spinning={isLoading}>
        {!templates || templates.length === 0 ? (
          <div className="py-24 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant text-center">
            <Empty description="Chưa có mẫu thiệp nào" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templates.map((tpl) => {
              const statusMeta = getTemplateStatusMeta(tpl.status);

              return (
                <div
                  key={tpl.id}
                  className="group bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                >
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] bg-surface-variant overflow-hidden">
                  {tpl.thumbnailUrl ? (
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20 italic">
                      <RiPaletteLine size={48} />
                    </div>
                  )}

                  {/* Status Tag */}
                  <div className="absolute top-4 right-4">
                    <Tag
                      color={statusMeta.color}
                      variant="filled"
                      className="m-0 px-3 py-1 rounded-full border-none shadow-sm font-medium uppercase text-[10px] tracking-wider"
                    >
                      {statusMeta.label}
                    </Tag>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        shape="circle"
                        size="large"
                        icon={<RiEditLine size={20} />}
                        className="!bg-white !text-primary border-none shadow-xl hover:!scale-110 transition-transform"
                        onClick={() => router.push(`/editor/${tpl.id}`)}
                      />
                    </Tooltip>
                    <Tooltip title="Nhân bản">
                      <Button
                        shape="circle"
                        size="large"
                        icon={<RiFileCopyLine size={20} />}
                        className="!bg-white !text-primary border-none shadow-xl hover:!scale-110 transition-transform"
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Xóa template này?"
                      description="Hành động này không thể hoàn tác."
                      onConfirm={() => handleDelete(tpl.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        shape="circle"
                        size="large"
                        icon={<RiDeleteBinLine size={20} />}
                        className="!bg-white !text-error border-none shadow-xl hover:!scale-110 transition-transform"
                      />
                    </Popconfirm>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors font-serif">
                      {tpl.title}
                    </h3>
                  </div>
                  <Text
                    type="secondary"
                    className="text-xs uppercase tracking-widest font-semibold mb-4 block"
                  >
                    {tpl.category?.name || "Chưa phân loại"}
                  </Text>

                  <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
                    <div className="flex items-center gap-4 text-xs font-semibold text-secondary">
                      <span className="flex items-center gap-1.5">
                        <RiEyeLine size={16} /> {tpl.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <RiShoppingBag3Line size={16} />{" "}
                        {tpl.purchaseCount || 0}
                      </span>
                    </div>
                    <Text strong className="text-primary text-body-md">
                      {tpl.price === 0
                        ? "Miễn phí"
                        : `${tpl.price.toLocaleString("vi-VN")}đ`}
                    </Text>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </Spin>

    </div>
  );
}
