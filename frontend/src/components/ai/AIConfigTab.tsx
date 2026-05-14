"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  App,
  Typography,
  Empty,
} from "antd";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiKey2Line,
  RiSettings4Line,
} from "@remixicon/react";
import {
  useAIConfigs,
  useCreateAIConfig,
  useDeleteAIConfig,
} from "@/hooks/useAI";
import type { AIConfig } from "@/api/ai.api";

const { Text, Title } = Typography;

const MODEL_OPTIONS: Record<string, { label: string; value: string }[]> = {
  openai: [
    { label: "GPT-4o (Khuyên dùng)", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  ],
  anthropic: [
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20240620" },
    { label: "Claude 3 Opus", value: "claude-3-opus-20240229" },
    { label: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
  ],
  google: [
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
    { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
    { label: "Gemini Pro", value: "gemini-pro" },
  ],
};

export function AIConfigTab() {
  const { message } = App.useApp();
  const { data: configs, isLoading } = useAIConfigs();
  const createConfig = useCreateAIConfig();
  const deleteConfig = useDeleteAIConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const provider = Form.useWatch("provider", form);
  const models = MODEL_OPTIONS[provider as keyof typeof MODEL_OPTIONS] || [];

  const handleAdd = async (values: Partial<AIConfig>) => {
    try {
      await createConfig.mutateAsync(values);
      message.success("Đã thêm cấu hình AI mới");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Không thể thêm cấu hình. Vui lòng thử lại.");
    }
  };

  const handleProviderChange = (value: string) => {
    // Auto-select the first model when provider changes
    const firstModel = MODEL_OPTIONS[value as keyof typeof MODEL_OPTIONS]?.[0]?.value;
    form.setFieldsValue({ model: firstModel });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig.mutateAsync(id);
      message.success("Đã xóa cấu hình");
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const columns = [
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      render: (v: string) => (
        <Tag color={v === "openai" ? "green" : "blue"} className="uppercase font-bold">
          {v}
        </Tag>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "API Key",
      dataIndex: "apiKey",
      key: "apiKey",
      render: (v: string) => (
        <Text type="secondary" className="font-mono">
          ••••••••{v.slice(-4)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (v: boolean) => (
        <Tag color={v ? "success" : "default"}>
          {v ? "Đang hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: unknown, row: AIConfig) => (
        <Button
          type="text"
          danger
          icon={<RiDeleteBinLine size={18} />}
          onClick={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-1">Cấu hình BYOK</Title>
          <Text type="secondary">
            Kết nối API Key của bạn để sử dụng các tính năng AI nâng cao.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<RiAddLine size={18} />}
          className="rounded-xl h-11 px-6 font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          Thêm cấu hình
        </Button>
      </div>

      <Table
        dataSource={configs ?? []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        className="border border-outline-variant rounded-xl overflow-hidden shadow-sm"
        pagination={false}
        locale={{ 
          emptyText: (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description="Chưa có cấu hình AI nào" 
            />
          ) 
        }}
      />

      <Modal
        title={
          <div className="flex items-center gap-2 mb-4">
            <RiKey2Line className="text-primary" />
            <span>Thêm cấu hình AI (BYOK)</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{ provider: "openai", isActive: true }}
          className="mt-6"
        >
          <Form.Item name="provider" label="Nhà cung cấp" rules={[{ required: true }]}>
            <Select size="large" className="rounded-xl" onChange={handleProviderChange}>
              <Select.Option value="openai">OpenAI (ChatGPT)</Select.Option>
              <Select.Option value="anthropic">Anthropic (Claude)</Select.Option>
              <Select.Option value="google">Google (Gemini)</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="model" label="Model" rules={[{ required: true }]}>
            <Select 
              size="large" 
              className="rounded-xl" 
              placeholder="Chọn model"
              options={models}
            />
          </Form.Item>

          <Form.Item name="apiKey" label="API Key" rules={[{ required: true }]}>
            <Input.Password
              placeholder="sk-..."
              size="large"
              className="rounded-xl"
              prefix={<RiKey2Line size={18} className="text-on-surface-variant" />}
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
              loading={createConfig.isPending}
              className="h-11 rounded-xl px-10 font-semibold"
            >
              Lưu cấu hình
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
