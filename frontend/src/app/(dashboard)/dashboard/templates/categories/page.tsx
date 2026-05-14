"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Breadcrumb,
  Card,
  App,
  Typography,
  Tooltip,
  Row,
  Col,
  Statistic,
  Select,
  Empty,
} from "antd";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLayoutLine,
  RiFileList3Line,
  RiStackLine,
  RiFoldersLine,
  RiTimeLine,
  RiSearchLine,
  RiFilter3Line,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import {
  useTemplateCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useTemplates";
import type { ApiTemplateCategory } from "@/types/api";

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiTemplateCategory | null>(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "main" | "sub">("all");

  const { data: categories, isLoading } = useTemplateCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Filtered data
  const filteredData = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c: ApiTemplateCategory) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase());

      let matchesType = true;
      if (typeFilter === "main") matchesType = !c.parentId;
      if (typeFilter === "sub") matchesType = !!c.parentId;

      return matchesSearch && matchesType;
    });
  }, [categories, search, typeFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!categories) return { total: 0, main: 0, sub: 0 };
    return {
      total: categories.length,
      main: categories.filter((c: ApiTemplateCategory) => !c.parentId).length,
      sub: categories.filter((c: ApiTemplateCategory) => c.parentId).length,
    };
  }, [categories]);

  // Sync name to slug
  const nameValue = Form.useWatch("name", form);
  useEffect(() => {
    if (nameValue && !editingCategory) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setFieldsValue({ slug });
    }
  }, [nameValue, form, editingCategory]);

  const handleOpenModal = (category?: ApiTemplateCategory) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleFinish = async (values: Omit<ApiTemplateCategory, 'id'>) => {
    try {
      const payload = {
        ...values,
        parentId: values.parentId === null ? undefined : values.parentId,
        iconUrl: values.iconUrl ?? undefined,
      };
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          payload,
        });
        message.success("Đã cập nhật danh mục");
      } else {
        await createCategory.mutateAsync(payload);
        message.success("Đã thêm danh mục mới");
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success("Đã xóa danh mục");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      message.error(apiErr.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong className="text-on-surface">
          {text}
        </Text>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (text: string) => (
        <code className="bg-surface-container-low px-2 py-0.5 rounded text-primary font-mono text-xs">
          {text}
        </code>
      ),
    },
    {
      title: "Loại",
      key: "type",
      render: (_: unknown, record: ApiTemplateCategory) => (
        <Text
          type="secondary"
          className="text-xs uppercase tracking-wider font-semibold"
        >
          {record.parentId ? "Danh mục con" : "Danh mục chính"}
        </Text>
      ),
    },
    {
      title: "Biểu tượng",
      dataIndex: "iconUrl",
      key: "iconUrl",
      align: "center" as const,
      render: (text: string) =>
        text ? (
          <img
            src={text}
            alt="icon"
            className="w-8 h-8 object-contain mx-auto"
          />
        ) : (
          <RiFileList3Line
            size={20}
            className="text-on-surface-variant/30 mx-auto"
          />
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "right" as const,
      render: (_: unknown, record: ApiTemplateCategory) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<RiEditLine size={18} className="text-secondary" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục?"
            description="Lưu ý: Chỉ có thể xóa nếu không có template nào thuộc danh mục này."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<RiDeleteBinLine size={18} className="text-error" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <App>
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <Breadcrumb
              items={[
                { title: "Dashboard", href: "/dashboard" },
                {
                  title: (
                    <span
                      onClick={() => router.push("/dashboard/templates")}
                      className="cursor-pointer hover:text-primary"
                    >
                      Mẫu thiệp
                    </span>
                  ),
                },
                { title: "Danh mục" },
              ]}
              className="mb-2"
            />
            <Title level={2} className="!mb-1 !font-serif">
              Quản lý Danh mục
            </Title>
            <Text type="secondary">
              Phân loại các mẫu thiệp theo mục đích và chủ đề.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<RiAddLine size={18} />}
            size="large"
            className="rounded-xl h-12 px-6"
            onClick={() => handleOpenModal()}
          >
            Thêm danh mục
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
                    Tổng danh mục
                  </span>
                }
                value={stats.total}
                prefix={
                  <RiFoldersLine size={20} className="mr-2 text-primary" />
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
                    Danh mục chính
                  </span>
                }
                value={stats.main}
                prefix={<RiStackLine size={20} className="mr-2 text-primary" />}
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
                    Cập nhật gần nhất
                  </span>
                }
                value="Hôm nay"
                prefix={<RiTimeLine size={20} className="mr-2 text-primary" />}
                styles={{
                  content: {
                    color: "#070235",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  },
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters & Table */}
        <Card
          variant="outlined"
          className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant overflow-hidden"
        >
          <div className="pb-6 flex flex-wrap justify-between items-center gap-4">
            <Space wrap size="middle">
              <Input
                placeholder="Tìm kiếm danh mục..."
                prefix={
                  <RiSearchLine size={18} className="text-on-surface-variant" />
                }
                className="w-80 rounded-lg h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "Tất cả loại" },
                  { value: "main", label: "Danh mục chính" },
                  { value: "sub", label: "Danh mục con" },
                ]}
                className="w-48 h-10"
              />
            </Space>
            <RiFilter3Line
              size={20}
              className="text-on-surface-variant cursor-pointer"
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              className: "px-6 py-4",
            }}
            className="border-t border-outline-variant"
            locale={{ 
              emptyText: (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="Không tìm thấy danh mục nào" 
                />
              ) 
            }}
          />
        </Card>

        <Modal
          title={
            <span className="font-serif text-xl">
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </span>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          centered
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="mt-6"
          >
            <Form.Item
              name="name"
              label={<Text strong>Tên danh mục</Text>}
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục" },
              ]}
            >
              <Input
                placeholder="vd: Đám cưới"
                size="large"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label={<Text strong>Slug</Text>}
              rules={[
                { required: true, message: "Vui lòng nhập slug" },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: "Slug chỉ chứa chữ thường, số và dấu gạch ngang",
                },
              ]}
            >
              <Input
                placeholder="vd: dam-cuoi"
                size="large"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="iconUrl"
              label={<Text strong>Icon URL (không bắt buộc)</Text>}
            >
              <Input
                placeholder="URL hình ảnh hoặc biểu tượng"
                size="large"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="h-11 rounded-xl px-6"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createCategory.isPending || updateCategory.isPending}
                className="h-11 rounded-xl px-10"
              >
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </App>
  );
}
