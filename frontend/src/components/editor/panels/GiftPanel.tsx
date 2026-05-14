"use client";

import React from "react";
import {
  Input,
  Collapse,
  Button,
  Modal,
  Form,
  Select,
  Upload,
  ColorPicker,
  Slider,
  InputNumber,
} from "antd";
import { RiSettings4Line, RiMagicLine } from "@remixicon/react";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type {
  BankAccount,
  GiftWidgetConfig,
  GiftWidgetElement,
} from "@/types/editor";
import { PaddingSection, BorderSection, ShadowSection } from "./CommonSettings";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

interface GiftPanelProps {
  element: GiftWidgetElement;
  onUpdate: (updates: Partial<GiftWidgetElement>) => void;
}

export function GiftPanel({ element, onUpdate }: GiftPanelProps) {
  const config = element.config || {};
  const [activeTab, setActiveTab] = React.useState("settings");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] =
    React.useState<BankAccount | null>(null);
  const [form] = Form.useForm();

  const accounts: BankAccount[] = config.accounts || [];

  const updateConfig = (newConfig: Partial<GiftWidgetConfig>) => {
    onUpdate({
      config: { ...config, ...newConfig },
    });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<GiftWidgetElement["templateVariable"]>>,
  ) => {
    onUpdate({
      templateVariable: {
        enabled: false,
        key: "",
        label: "",
        description: "",
        required: false,
        ...element.templateVariable,
        ...updates,
      },
    });
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    const newAccounts = accounts.filter((a) => a.id !== id);
    updateConfig({ accounts: newAccounts });
  };

  const handleSaveAccount = (values: Omit<BankAccount, "id">) => {
    let newAccounts: BankAccount[];
    if (editingAccount) {
      newAccounts = accounts.map((a) =>
        a.id === editingAccount.id ? { ...a, ...values } : a,
      );
    } else {
      newAccounts = [...accounts, { ...values, id: Date.now().toString() }];
    }
    updateConfig({ accounts: newAccounts });
    setIsModalOpen(false);
  };

  const settingsContent = (
    <div className="px-1 py-2 space-y-6">
      {/* Icon Preview & Change */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 gap-4">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-premium flex items-center justify-center text-4xl">
          {config.icon || "🎁"}
        </div>
        <div className="flex gap-2">
          <Button size="small" className="rounded-lg font-bold">
            Đổi Ảnh
          </Button>
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            className="text-slate-400"
          >
            Xem thử
          </Button>
        </div>
      </div>

      <Collapse
        ghost
        defaultActiveKey={["bank"]}
        expandIconPlacement="end"
        className="premium-collapse"
        items={[
          {
            key: "bank",
            label: (
              <span className="font-bold text-slate-700">
                Thông tin ngân hàng
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Danh sách tài khoản
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    className="bg-primary text-[10px] h-7 px-3"
                    onClick={handleAddAccount}
                  >
                    Thêm tài khoản
                  </Button>
                </div>

                <div className="space-y-2">
                  {accounts.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <span className="text-xs text-slate-400">
                        Chưa có thông tin tài khoản
                      </span>
                    </div>
                  ) : (
                    accounts.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-slate-100 rounded-xl mb-2 flex items-center justify-between group shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-primary uppercase tracking-tighter">
                            {item.type}
                          </div>
                          <div className="text-sm font-bold text-slate-700 truncate">
                            {item.recipientName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.bankName} - {item.accountNumber}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditAccount(item)}
                          />
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteAccount(item.id)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tiêu đề khi hiển thị
                  </label>
                  <Input
                    value={config.modalTitle || "Hộp Quà Yêu Thương"}
                    onChange={(e) =>
                      updateConfig({ modalTitle: e.target.value })
                    }
                    className="h-11 rounded-xl border-slate-200"
                  />
                </div>
              </div>
            ),
          },
          {
            key: "style",
            label: (
              <span className="font-bold text-slate-700">
                Cài đặt giao diện
              </span>
            ),
            children: (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Màu nền
                  </span>
                  <ColorPicker
                    value={config.backgroundColor || "#fff"}
                    onChange={(c) =>
                      updateConfig({ backgroundColor: c.toHexString() })
                    }
                    size="small"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Độ mờ
                    </span>
                    <InputNumber
                      size="small"
                      value={config.opacity || 1}
                      onChange={(v) =>
                        updateConfig({ opacity: v ?? undefined })
                      }
                      precision={2}
                      className="w-16"
                    />
                  </div>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={config.opacity || 1}
                    onChange={(v) => updateConfig({ opacity: v })}
                    tooltip={{ open: false }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "padding",
            label: <span className="font-bold text-slate-700">Khoảng đệm</span>,
            children: <PaddingSection element={element} onUpdate={onUpdate} />,
          },
          {
            key: "border",
            label: <span className="font-bold text-slate-700">Đường viền</span>,
            children: <BorderSection element={element} onUpdate={onUpdate} />,
          },
          {
            key: "shadow",
            label: <span className="font-bold text-slate-700">Đổ bóng</span>,
            children: <ShadowSection element={element} onUpdate={onUpdate} />,
          },
          {
            key: "variable",
            label: <span className="font-bold text-slate-700">Biến mẫu</span>,
            children: (
              <TemplateVariableSection
                element={element}
                onChange={handleTemplateVariableChange}
              />
            ),
          },
        ]}
      />
    </div>
  );

  const effectsContent = (
    <ElementEffectsPanel
      element={element}
      onUpdate={onUpdate}
      subjectLabel="tiện ích"
    />
  );

  return (
    <div className="space-y-6">
      <EditorSegmentedPanel
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "settings",
            label: "Cài đặt",
            icon: <RiSettings4Line size={16} />,
            content: settingsContent,
          },
          {
            key: "effects",
            label: "Hiệu ứng",
            icon: <RiMagicLine size={16} />,
            content: effectsContent,
          },
        ]}
      />

      {/* Account Modal */}
      <Modal
        title={
          <span className="font-bold">
            {editingAccount ? "Sửa tài khoản" : "Thêm tài khoản mới"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="premium-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAccount}
          className="pt-4"
        >
          <Form.Item
            name="type"
            label="Tên hiển thị"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "Cô dâu", label: "Cô dâu" },
                { value: "Chú rể", label: "Chú rể" },
                { value: "Nhà trai", label: "Nhà trai" },
                { value: "Nhà gái", label: "Nhà gái" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="recipientName"
            label="Tên người nhận"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="bankName"
            label="Tên ngân hàng"
            rules={[{ required: true }]}
          >
            <Input placeholder="Vietcombank" />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="Số tài khoản"
            rules={[{ required: true }]}
          >
            <Input placeholder="1234567890" />
          </Form.Item>
          <Form.Item label="Mã QR chuyển khoản">
            <Upload listType="picture-card" maxCount={1}>
              <button style={{ border: 0, background: "none" }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </button>
            </Upload>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-primary">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
