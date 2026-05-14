"use client";

import React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  App,
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Result,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiSaveLine,
} from "@remixicon/react";
import {
  useFillInvitationVariables,
  useInvitation,
  usePublishInvitation,
  useUnpublishInvitation,
} from "@/hooks/useInvitations";
import type {
  ApiInvitation,
  ApiTemplateVariableDefinition,
} from "@/types/api";
import { ScaledCanvasPreviewRenderer } from "./ScaledCanvasPreviewRenderer";

const { Title, Text } = Typography;

interface InvitationDetailDrawerProps {
  invitation: ApiInvitation | null;
  onClose: () => void;
}

function normalizeFormValue(
  variable: ApiTemplateVariableDefinition,
  value: unknown,
) {
  if (value === undefined || value === null || value === "") return undefined;

  if (variable.type === "date" || variable.type === "datetime") {
    if (dayjs.isDayjs(value)) {
      return variable.type === "date"
        ? (value as Dayjs).format("YYYY-MM-DD")
        : (value as Dayjs).format("YYYY-MM-DD HH:mm:ss");
    }
    return value;
  }

  if (variable.type === "json") {
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as Record<string, unknown>;
      } catch {
        return value;
      }
    }
    return value;
  }

  return value;
}

function toFormInitialValue(
  variable: ApiTemplateVariableDefinition,
  value: unknown,
) {
  if (value === undefined || value === null || value === "") {
    if (!variable.defaultValue) return undefined;
    if (variable.type === "date" || variable.type === "datetime") {
      return dayjs(variable.defaultValue);
    }
    return variable.defaultValue;
  }

  if (variable.type === "date" || variable.type === "datetime") {
    return typeof value === "string" ? dayjs(value) : value;
  }

  if (variable.type === "json") {
    return typeof value === "object"
      ? JSON.stringify(value, null, 2)
      : String(value);
  }

  return value;
}

function isFilledValue(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function buildVariablesPayload(
  values: Record<string, unknown>,
  definitions: ApiTemplateVariableDefinition[],
) {
  return definitions.map((variable) => {
    const normalized = normalizeFormValue(variable, values[variable.key]);

    if (variable.type === "json" && typeof normalized === "object") {
      return {
        key: variable.key,
        valueJson: normalized as Record<string, unknown>,
      };
    }

    return {
      key: variable.key,
      valueText:
        normalized === undefined || normalized === null ? "" : String(normalized),
    };
  });
}

function InvitationVariableField({
  variable,
}: {
  variable: ApiTemplateVariableDefinition;
}) {
  const commonLabel = (
    <div className="flex items-center gap-2">
      <span>{variable.label}</span>
      {variable.required && <Tag color="error">Bắt buộc</Tag>}
    </div>
  );

  if (variable.type === "date") {
    return (
      <Form.Item
        name={variable.key}
        label={commonLabel}
        rules={[
          {
            required: variable.required,
            message: `Vui lòng nhập ${variable.label.toLowerCase()}`,
          },
        ]}
        tooltip={variable.placeholder || variable.key}
      >
        <DatePicker className="h-11 w-full rounded-xl" format="DD/MM/YYYY" />
      </Form.Item>
    );
  }

  if (variable.type === "datetime") {
    return (
      <Form.Item
        name={variable.key}
        label={commonLabel}
        rules={[
          {
            required: variable.required,
            message: `Vui lòng nhập ${variable.label.toLowerCase()}`,
          },
        ]}
        tooltip={variable.placeholder || variable.key}
      >
        <DatePicker
          showTime
          className="h-11 w-full rounded-xl"
          format="DD/MM/YYYY HH:mm"
        />
      </Form.Item>
    );
  }

  if (variable.type === "json") {
    return (
      <Form.Item
        name={variable.key}
        label={commonLabel}
        tooltip={variable.placeholder || variable.key}
        rules={[
          {
            validator: async (_, value) => {
              if (!value && !variable.required) return;
              if (!value && variable.required) {
                throw new Error(`Vui lòng nhập ${variable.label.toLowerCase()}`);
              }
              try {
                JSON.parse(value);
              } catch {
                throw new Error("JSON không hợp lệ");
              }
            },
          },
        ]}
      >
        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 8 }}
          className="rounded-xl"
          placeholder={variable.placeholder || `JSON cho ${variable.label}`}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      name={variable.key}
      label={commonLabel}
      tooltip={variable.placeholder || variable.key}
      rules={[
        {
          required: variable.required,
          message: `Vui lòng nhập ${variable.label.toLowerCase()}`,
        },
      ]}
    >
      <Input
        className="h-11 rounded-xl"
        placeholder={variable.placeholder || variable.label}
      />
    </Form.Item>
  );
}

export default function InvitationDetailDrawer({
  invitation,
  onClose,
}: InvitationDetailDrawerProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const invitationId = invitation?.id || "";
  const { data: detail, isLoading, error } = useInvitation(invitationId);
  const fillVariables = useFillInvitationVariables();
  const publishInvitation = usePublishInvitation();
  const unpublishInvitation = useUnpublishInvitation();

  const activeInvitation = detail || invitation;
  const variableDefinitions = React.useMemo(
    () => detail?.variableDefinitions || [],
    [detail?.variableDefinitions],
  );
  const watchedValues = Form.useWatch([], form) as Record<string, unknown> | undefined;
  const watchedSlug = Form.useWatch("__slug", form) as string | undefined;

  React.useEffect(() => {
    if (!detail) return;

    const nextValues: Record<string, unknown> = {};
    detail.variableDefinitions.forEach((variable) => {
      nextValues[variable.key] = toFormInitialValue(
        variable,
        detail.variableValues?.[variable.key],
      );
    });
    nextValues.__slug = detail.slug || "";
    form.setFieldsValue(nextValues);
  }, [detail, form]);

  const previewVariableValues = React.useMemo(() => {
    const base = detail?.variableValues || invitation?.variableValues || {};
    const merged: Record<string, unknown> = { ...base };

    variableDefinitions.forEach((variable) => {
      const current = watchedValues?.[variable.key];
      const normalized = normalizeFormValue(variable, current);
      if (normalized !== undefined) {
        merged[variable.key] = normalized;
      }
    });

    return merged as Record<
      string,
      string | number | boolean | Record<string, unknown>
    >;
  }, [detail?.variableValues, invitation?.variableValues, variableDefinitions, watchedValues]);

  const missingRequiredVariables = React.useMemo(
    () =>
      variableDefinitions.filter((variable) => {
        if (!variable.required) return false;
        const value =
          previewVariableValues[variable.key] ?? detail?.variableValues?.[variable.key];
        return !isFilledValue(value);
      }),
    [detail?.variableValues, previewVariableValues, variableDefinitions],
  );

  const shareLink =
    activeInvitation?.slug && activeInvitation?.accessToken
      ? `${window.location.origin}/invitations/${activeInvitation.slug}?token=${activeInvitation.accessToken}`
      : null;

  const handleCopyLink = async () => {
    if (!shareLink) {
      message.warning("Thiệp chưa được xuất bản");
      return;
    }

    await navigator.clipboard.writeText(shareLink);
    message.success("Đã sao chép liên kết thiệp");
  };

  const handleSaveVariables = async () => {
    if (!detail) return;
    await form.validateFields();

    const values = form.getFieldsValue(true) as Record<string, unknown>;
    await fillVariables.mutateAsync({
      id: detail.id,
      variables: buildVariablesPayload(values, variableDefinitions),
    });
    message.success("Đã lưu dữ liệu thiệp");
  };

  const handlePublish = async () => {
    if (!detail) return;
    await handleSaveVariables();
    await publishInvitation.mutateAsync({
      id: detail.id,
      slug: watchedSlug?.trim() || undefined,
    });
    message.success("Đã xuất bản thiệp");
  };

  const handleUnpublish = async () => {
    if (!detail) return;
    await unpublishInvitation.mutateAsync({ id: detail.id });
    message.success("Đã ẩn thiệp khỏi public");
  };

  return (
    <Drawer
      title="Tạo và xuất bản Thiệp mời"
      open={!!invitation}
      onClose={onClose}
      size="large"
      extra={
        <Space>
          <Button icon={<RiFileCopyLine size={18} />} onClick={handleCopyLink}>
            Copy Link
          </Button>
          {activeInvitation?.isPublic && shareLink ? (
            <Button
              type="primary"
              icon={<RiExternalLinkLine size={18} />}
              href={shareLink}
              target="_blank"
            >
              Xem thực tế
            </Button>
          ) : null}
        </Space>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spin size="large" />
        </div>
      ) : error || !activeInvitation ? (
        <Result
          status="error"
          title="Không tải được dữ liệu thiệp"
          subTitle="Hãy thử mở lại thiệp này."
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-surface p-4">
              {activeInvitation.canvasData ? (
                <ScaledCanvasPreviewRenderer
                  canvasData={activeInvitation.canvasData}
                  variableValues={previewVariableValues}
                />
              ) : (
                <div className="flex min-h-[420px] items-center justify-center">
                  <Empty description="Thiệp chưa có dữ liệu canvas" />
                </div>
              )}
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Mã thiệp" span={2}>
                <Text strong className="font-mono text-primary">
                  {activeInvitation.id.slice(0, 8).toUpperCase()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {activeInvitation.customerName || "Khách hàng"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {activeInvitation.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Mẫu thiệp">
                {activeInvitation.templateTitle || "Mẫu thiệp"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {activeInvitation.isPublic ? (
                  <Tag color="success">Đã xuất bản</Tag>
                ) : (
                  <Tag color="default">Bản nháp</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Title level={4} className="!mb-1">
                    Dữ liệu thiệp
                  </Title>
                  <Text type="secondary">
                    Điền thông tin cho các biến của template rồi xuất bản.
                  </Text>
                </div>
                <Tag color={missingRequiredVariables.length ? "warning" : "success"}>
                  {missingRequiredVariables.length
                    ? `Thiếu ${missingRequiredVariables.length} biến`
                    : "Sẵn sàng"}
                </Tag>
              </div>

              {variableDefinitions.length === 0 ? (
                <Empty
                  description="Template này chưa có variable nào được publish"
                />
              ) : (
                <Form layout="vertical" form={form}>
                  <div className="space-y-1">
                    {variableDefinitions
                      .slice()
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((variable) => (
                        <InvitationVariableField
                          key={variable.key}
                          variable={variable}
                        />
                      ))}
                  </div>
                </Form>
              )}

              <Divider />

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Slug public
                </label>
                <Input
                  className="h-11 rounded-xl"
                  value={watchedSlug}
                  onChange={(e) =>
                    form.setFieldValue("__slug", e.target.value.toLowerCase())
                  }
                  placeholder="vd: lan-va-minh-2026"
                />
                <Text type="secondary" className="text-xs">
                  Bỏ trống để hệ thống tự sinh khi xuất bản.
                </Text>
              </div>

              {missingRequiredVariables.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Còn thiếu:{" "}
                  {missingRequiredVariables.map((item) => item.label).join(", ")}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  icon={<RiSaveLine size={16} />}
                  onClick={handleSaveVariables}
                  loading={fillVariables.isPending}
                  className="h-11 rounded-xl"
                >
                  Lưu dữ liệu
                </Button>

                {activeInvitation.isPublic ? (
                  <Button
                    danger
                    onClick={handleUnpublish}
                    loading={unpublishInvitation.isPending}
                    className="h-11 rounded-xl"
                  >
                    Ẩn thiệp
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<RiCheckLine size={16} />}
                    onClick={handlePublish}
                    loading={
                      publishInvitation.isPending || fillVariables.isPending
                    }
                    disabled={missingRequiredVariables.length > 0}
                    className="h-11 rounded-xl"
                  >
                    Xuất bản thiệp
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
