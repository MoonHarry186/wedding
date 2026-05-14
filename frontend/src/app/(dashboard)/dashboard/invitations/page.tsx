"use client";

import React, { useState } from "react";
import {
  App,
  Table,
  Card,
  Typography,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Tooltip,
  Breadcrumb,
  Statistic,
  Row,
  Col,
  Empty,
  Form,
  Modal,
  Radio,
} from "antd";
import {
  RiSearchLine,
  RiDownload2Line,
  RiEyeLine,
  RiFileCopyLine,
  RiEditLine,
  RiCalendarLine,
  RiLayoutLine,
  RiMailSendLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import {
  useCreateAdminInvitation,
  useInvitations,
} from "@/hooks/useInvitations";
import { useTemplates } from "@/hooks/useTemplates";
import { useAuthStore } from "@/store/auth.store";
import type { ApiInvitation } from "@/types/api";
import InvitationDetailDrawer from "@/components/invitations/InvitationDetailDrawer";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function InvitationsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id;
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedInvitation, setSelectedInvitation] =
    useState<ApiInvitation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm<{
    mode: "blank" | "from_template";
    templateId?: string;
  }>();
  const createMode = Form.useWatch("mode", createForm);

  const { data: invitations, isLoading } = useInvitations({
    tenantId: tenantId || undefined,
    search: search || undefined,
    templateId: selectedTemplate,
  });

  const { data: templates } = useTemplates({ tenantId: tenantId || undefined });
  const { mutateAsync: createAdminInvitation, isPending: isCreatingInvitation } =
    useCreateAdminInvitation();

  const publishedTemplates =
    templates?.filter((template) => template.status === "published") ?? [];

  const getVariableDisplay = (
    value: ApiInvitation["variableValues"][string] | undefined,
    fallback: string,
  ) =>
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : fallback;

  const columns = [
    {
      title: "Mã thiệp",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Text strong className="font-mono text-xs">
          {id.slice(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: unknown, record: ApiInvitation) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: "#1e1b4b" }}>
            {getVariableDisplay(record.variableValues?.customer_name, "U")[0]?.toUpperCase() || "U"}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-body-sm">
              {getVariableDisplay(record.variableValues?.customer_name, "Khách hàng")}
            </Text>
            <Text type="secondary" className="text-[11px]">
              {getVariableDisplay(record.variableValues?.customer_email, "No email")}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Mẫu thiệp",
      key: "template",
      render: (_: unknown, record: ApiInvitation) => (
        <Space>
          <div className="w-8 h-10 bg-surface-container rounded-sm border border-outline-variant flex items-center justify-center overflow-hidden">
            <RiLayoutLine size={14} className="text-on-surface-variant" />
          </div>
          <Text className="text-body-sm">
            {record.templateTitle || "Thiệp tuỳ chỉnh"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Text type="secondary" className="text-body-sm">
          {new Date(date).toLocaleDateString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, record: ApiInvitation) => (
        <Space size={4}>
          <Tag
            color={record.isPublic ? "success" : "default"}
            variant="filled"
            className="rounded-full px-3 text-[11px]"
          >
            {record.isPublic ? "Công khai" : "Nháp"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: ApiInvitation) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<RiEyeLine size={18} className="text-secondary" />}
              onClick={() => setSelectedInvitation(record)}
            />
          </Tooltip>
          <Tooltip title="Copy link">
            <Button
              type="text"
              icon={<RiFileCopyLine size={18} className="text-secondary" />}
              onClick={() => {
                const link = `${window.location.origin}/invitations/${record.slug}?token=${record.accessToken}`;
                navigator.clipboard.writeText(link);
              }}
            />
          </Tooltip>
          <Tooltip title="Mở editor">
            <Button
              type="text"
              icon={<RiEditLine size={18} className="text-secondary" />}
              onClick={() => router.push(`/editor/invitations/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreateInvitation = async () => {
    const values = await createForm.validateFields();
    const createdInvitation = await createAdminInvitation(values);
    message.success(
      values.mode === "blank"
        ? "Đã tạo thiệp trống"
        : "Đã tạo thiệp mới từ mẫu",
    );
    setIsCreateModalOpen(false);
    createForm.resetFields();
    router.push(`/editor/invitations/${createdInvitation.id}`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Breadcrumb
            items={[
              { title: "Dashboard", href: "/dashboard" },
              { title: "Kinh doanh" },
              { title: "Quản lý Thiệp" },
            ]}
            className="mb-2"
          />
          <Title level={2} className="!mb-1 !font-serif">
            Quản lý Thiệp
          </Title>
          <Text type="secondary">
            Theo dõi và quản lý các thiệp mời đã gửi cho khách hàng.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<RiMailSendLine size={18} />}
          size="large"
          className="rounded-xl h-12 px-6"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Gửi thiệp mới
        </Button>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card
            variant="outlined"
            className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
          >
            <Statistic
              title={
                <span className="text-label-caps text-secondary uppercase">
                  Tổng số thiệp đã tạo
                </span>
              }
              value={invitations?.length ?? 0}
              prefix={
                <RiMailSendLine size={20} className="mr-2 text-primary" />
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
                  Đang công khai
                </span>
              }
              value={invitations?.filter((item) => item.isPublic).length ?? 0}
              prefix={<RiEyeLine size={20} className="mr-2 text-primary" />}
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
                  Chưa điền thông tin
                </span>
              }
              value={
                invitations?.filter(
                  (item) => !item.variableValues || Object.keys(item.variableValues).length === 0,
                ).length ?? 0
              }
              prefix={
                <RiCalendarLine size={20} className="mr-2 text-primary" />
              }
              styles={{ content: { color: "#070235", fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        variant="outlined"
        className="shadow-[0px_2px_4px_rgba(30,27,75,0.04)] border-outline-variant"
      >
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <Space wrap size="middle">
            <Input
              placeholder="Tìm kiếm khách hàng hoặc ID..."
              prefix={
                <RiSearchLine size={18} className="text-on-surface-variant" />
              }
              className="w-80 rounded-lg h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="Lọc theo mẫu thiệp"
              className="w-56 h-10"
              allowClear
              onChange={setSelectedTemplate}
              options={templates?.map((t) => ({ label: t.title, value: t.id }))}
            />
            <RangePicker
              className="h-10 rounded-lg"
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={setDateRange}
            />
          </Space>
          <Button
            icon={<RiDownload2Line size={18} />}
            className="rounded-lg h-10"
          >
            Xuất báo cáo
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={invitations}
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
                description="Chưa có thiệp mời nào"
              />
            ),
          }}
        />
      </Card>

      <InvitationDetailDrawer
        invitation={selectedInvitation}
        onClose={() => setSelectedInvitation(null)}
      />

      <Modal
        title="Tạo thiệp mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => void handleCreateInvitation()}
        okText="Tạo thiệp"
        cancelText="Hủy"
        confirmLoading={isCreatingInvitation}
      >
        <Form
          form={createForm}
          layout="vertical"
          className="pt-4"
          initialValues={{ mode: "from_template" }}
        >
          <Form.Item
            name="mode"
            label="Kiểu tạo thiệp"
            rules={[{ required: true, message: "Vui lòng chọn cách tạo" }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: "Từ template", value: "from_template" },
                { label: "Thiệp trống", value: "blank" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="templateId"
            label="Chọn mẫu thiệp"
            dependencies={["mode"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("mode") !== "from_template") {
                    return Promise.resolve();
                  }
                  if (value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Vui lòng chọn một mẫu thiệp"),
                  );
                },
              }),
            ]}
            extra="Admin tạo nhanh không yêu cầu nhập thông tin khách hàng ở bước này."
          >
            <Select
              placeholder="Chọn một template đã xuất bản"
              options={publishedTemplates.map((template) => ({
                label: template.title,
                value: template.id,
              }))}
              showSearch
              optionFilterProp="label"
              disabled={
                publishedTemplates.length === 0 ||
                createMode !== "from_template"
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
