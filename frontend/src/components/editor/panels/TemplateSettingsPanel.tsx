"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Select, Input, InputNumber, App, Form } from "antd";
import { RiImageLine, RiUploadCloudLine } from "@remixicon/react";
import isEqual from "lodash/isEqual";
import { mediaApi, type MediaFile } from "@/api/media.api";
import {
  useUpdateTemplate,
  useTemplateCategories,
  useTemplate,
} from "@/hooks/useTemplates";
import { TemplateThumbnailModal } from "@/components/editor/modals/TemplateThumbnailModal";
import { useParams } from "next/navigation";
import { useEditorStore } from "@/store/editor.store";
import type { ApiTemplate, ApiTemplateCategory } from "@/types/api";

export function TemplateSettingsPanel() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const params = useParams();
  const templateId = params.id as string;
  const { data: categories } = useTemplateCategories();
  const { data: template } = useTemplate(templateId);
  const updateTemplate = useUpdateTemplate();
  const { backgroundImage } = useEditorStore();
  const [uploadedImages, setUploadedImages] = React.useState<MediaFile[]>([]);
  const [loadingUploadedImages, setLoadingUploadedImages] =
    React.useState(false);
  const [isUploadedImagesModalOpen, setIsUploadedImagesModalOpen] =
    React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = React.useState<
    string | null
  >(null);
  const lastSubmittedValuesRef = useRef<{
    title: string | null;
    description: string | null;
    price: number | null;
    thumbnailUrl: string | null;
  }>({
    title: null,
    description: null,
    price: null,
    thumbnailUrl: null,
  });
  const latestTemplateRef = useRef(template);

  useEffect(() => {
    latestTemplateRef.current = template;
  }, [template]);

  // Sync template data to form
  useEffect(() => {
    if (template) {
      lastSubmittedValuesRef.current = {
        title: template.title,
        description: template.description,
        price: template.price,
        thumbnailUrl: template.thumbnailUrl,
      };
      form.setFieldsValue({
        title: template.title,
        description: template.description ?? undefined,
        categoryId: template.categoryId,
        price: template.price,
        currency: template.currency,
        status: template.status,
      });
    }
  }, [template, form]);

  const handleUpdate = useCallback(
    async (values: Partial<ApiTemplate>) => {
      if (!templateId) return;
      try {
        await updateTemplate.mutateAsync({
          id: templateId,
          payload: values,
        });
        if ("title" in values) message.success("Đã cập nhật tiêu đề");
        if ("description" in values) message.success("Đã cập nhật mô tả");
        if ("categoryId" in values) message.success("Đã cập nhật danh mục");
        if ("price" in values) message.success("Đã cập nhật giá");
        if ("currency" in values) message.success("Đã cập nhật tiền tệ");
        if ("thumbnailUrl" in values)
          message.success("Đã cập nhật ảnh đại diện");
        if ("status" in values) message.success("Đã cập nhật trạng thái");
      } catch {
        message.error("Không thể cập nhật thông tin");
      }
    },
    [message, templateId, updateTemplate],
  );

  const commitFieldUpdate = useCallback(
    async <T,>(
      fieldName: string,
      nextValue: T,
      currentValue: T,
      lastSubmittedValue: T,
      payload: Partial<ApiTemplate>,
      options?: {
        skipValidation?: boolean;
      },
    ) => {
      if (!templateId || !latestTemplateRef.current) return;
      if (isEqual(nextValue, currentValue)) return;
      if (isEqual(nextValue, lastSubmittedValue)) return;

      if (!options?.skipValidation) {
        try {
          await form.validateFields([fieldName]);
        } catch {
          return false;
        }
      }

      await handleUpdate(payload);
      return true;
    },
    [form, handleUpdate, templateId],
  );

  const handleTextFieldCommit = useCallback(
    async (
      fieldName: "title" | "description",
      options?: {
        trim?: boolean;
        emptyAsNull?: boolean;
      },
    ) => {
      const currentTemplate = latestTemplateRef.current;
      if (!templateId || !currentTemplate) return;

      const rawValue = form.getFieldValue(fieldName);
      if (typeof rawValue !== "string") return;

      const trimmedValue = options?.trim ? rawValue.trim() : rawValue;
      const nextValue =
        options?.emptyAsNull && trimmedValue === "" ? null : trimmedValue;

      const currentValue =
        fieldName === "title"
          ? currentTemplate.title
          : (currentTemplate.description ?? null);

      const didCommit = await commitFieldUpdate(
        fieldName,
        nextValue,
        currentValue,
        lastSubmittedValuesRef.current[fieldName],
        { [fieldName]: nextValue } as Partial<ApiTemplate>,
      );

      if (didCommit) {
        lastSubmittedValuesRef.current[fieldName] = nextValue;
      }
    },
    [commitFieldUpdate, form, templateId],
  );

  const loadUploadedImages = useCallback(async () => {
    setLoadingUploadedImages(true);
    try {
      const files = await mediaApi.list();
      setUploadedImages(files);
    } finally {
      setLoadingUploadedImages(false);
    }
  }, []);

  const openUploadedImagesModal = useCallback(() => {
    setIsUploadedImagesModalOpen(true);
    void loadUploadedImages();
  }, [loadUploadedImages]);

  const handleThumbnailSelect = useCallback(
    async (url: string) => {
      const currentTemplate = latestTemplateRef.current;
      if (!currentTemplate) return;

      const didCommit = await commitFieldUpdate(
        "thumbnailUrl",
        url,
        currentTemplate.thumbnailUrl ?? null,
        lastSubmittedValuesRef.current.thumbnailUrl,
        { thumbnailUrl: url },
        { skipValidation: true },
      );

      if (didCommit) {
        lastSubmittedValuesRef.current.thumbnailUrl = url;
        setThumbnailPreviewUrl(url);
        setIsUploadedImagesModalOpen(false);
      }
    },
    [commitFieldUpdate],
  );

  const handleThumbnailUpload = useCallback(
    async (file: File) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        message.error("Chỉ hỗ trợ JPG, PNG, WebP, GIF");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        message.error("File tối đa 10MB");
        return;
      }

      setUploadingImage(true);
      try {
        const media = await mediaApi.upload(file);
        setUploadedImages((prev) => [media, ...prev]);
        setThumbnailPreviewUrl(media.url);
        message.success("Đã tải ảnh lên");
      } catch {
        message.error("Tải ảnh thất bại");
      } finally {
        setUploadingImage(false);
      }
    },
    [message],
  );

  const handlePriceCommit = useCallback(async () => {
    if (!templateId || !template) return;

    try {
      const currentFormValue = form.getFieldValue("price");
      if (
        currentFormValue == null ||
        isEqual(currentFormValue, template.price) ||
        isEqual(currentFormValue, lastSubmittedValuesRef.current.price)
      ) {
        return;
      }

      const values = await form.validateFields(["price"]);
      const nextPrice = values.price;

      if (typeof nextPrice !== "number") return;

      const didCommit = await commitFieldUpdate(
        "price",
        nextPrice,
        template.price,
        lastSubmittedValuesRef.current.price,
        { price: nextPrice },
      );

      if (didCommit) {
        lastSubmittedValuesRef.current.price = nextPrice;
      }
    } catch {
      // Skip request when the price field has not passed validation yet.
    }
  }, [commitFieldUpdate, form, template, templateId]);

  const handleSelectCommit = useCallback(
    (fieldName: "categoryId" | "currency" | "status") =>
      async (value: string) => {
        const currentTemplate = latestTemplateRef.current;
        if (!currentTemplate) return;

        const currentValue =
          fieldName === "categoryId"
            ? currentTemplate.categoryId
            : fieldName === "currency"
              ? currentTemplate.currency
              : currentTemplate.status;

        return commitFieldUpdate(
          fieldName,
          value,
          currentValue as string | null,
          currentValue as string | null,
          { [fieldName]: value } as Partial<ApiTemplate>,
        );
      },
    [commitFieldUpdate],
  );

  const handleStatusChange = useCallback(
    (nextStatus: "private" | "published") => {
      const currentTemplate = latestTemplateRef.current;
      if (!currentTemplate) return;
      if (nextStatus === currentTemplate.status) return;

      void modal.confirm({
        title:
          nextStatus === "published"
            ? "Xác nhận chuyển sang Công khai"
            : "Xác nhận chuyển sang Riêng tư",
        content:
          nextStatus === "published"
            ? "Thiệp sẽ có thể được truy cập công khai qua đường link chia sẻ. Hãy chắc chắn nội dung đã sẵn sàng."
            : "Thiệp sẽ bị ẩn khỏi truy cập công khai cho đến khi bạn chuyển lại sang Công khai.",
        okText: "Xác nhận",
        cancelText: "Hủy",
        okButtonProps: {
          danger: nextStatus === "published",
        },
        onCancel: () => {
          form.setFieldValue("status", currentTemplate.status);
        },
        onOk: async () => {
          const didCommit = await handleSelectCommit("status")(nextStatus);
          if (!didCommit) {
            form.setFieldValue("status", currentTemplate.status);
          }
        },
      });
    },
    [form, handleSelectCommit, modal],
  );

  const flattenCategories = (
    items: ApiTemplateCategory[],
    prefix = "",
  ): Array<{
    value: string;
    label: string;
  }> =>
    items.flatMap((item) => {
      const label = prefix ? `${prefix} / ${item.name}` : item.name;
      return [
        { value: item.id, label },
        ...flattenCategories(item.children || [], label),
      ];
    });

  const categoryOptions = categories ? flattenCategories(categories) : [];
  const previewImageUrl =
    template?.thumbnailUrl ?? thumbnailPreviewUrl ?? backgroundImage ?? null;
  const hasThumbnail = Boolean(previewImageUrl);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-5">
        <Form form={form} layout="vertical" requiredMark={false}>
          {/* Title */}
          <Form.Item
            name="title"
            label={
              <span className="text-[16px] font-bold text-slate-800">
                Tiêu đề thiệp<span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input
              className="h-10 premium-input"
              placeholder="Nhập tiêu đề thiệp"
              onBlur={() => {
                void handleTextFieldCommit("title", { trim: true });
              }}
              onPressEnter={() => {
                void handleTextFieldCommit("title", { trim: true });
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="text-[16px] font-bold text-slate-800">
                Mô tả
              </span>
            }
            rules={[{ max: 1000, message: "Mô tả tối đa 1000 ký tự" }]}
          >
            <Input.TextArea
              className="premium-input"
              placeholder="Nhập mô tả ngắn cho mẫu thiệp"
              autoSize={{ minRows: 5, maxRows: 10 }}
              maxLength={1000}
              onBlur={() => {
                void handleTextFieldCommit("description", {
                  trim: true,
                  emptyAsNull: true,
                });
              }}
              onPressEnter={(event) => {
                if (event.shiftKey) return;
                void handleTextFieldCommit("description", {
                  trim: true,
                  emptyAsNull: true,
                });
              }}
            />
          </Form.Item>

          {/* Category */}
          <Form.Item
            name="categoryId"
            label={
              <span className="text-[16px] font-bold text-slate-800">
                Danh mục<span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              className="h-10 premium-select"
              options={categoryOptions}
              placeholder="Chọn danh mục"
              variant="outlined"
              loading={!categories}
              onChange={(value) => {
                void handleSelectCommit("categoryId")(value);
              }}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="price"
              label={
                <span className="text-[16px] font-bold text-slate-800">
                  Giá bán
                </span>
              }
              rules={[
                { type: "number", min: 0, message: "Giá phải từ 0 trở lên" },
              ]}
            >
              <InputNumber
                className="h-10 premium-input !w-full min-w-[160px]"
                min={0}
                placeholder="0"
                controls={false}
                formatter={(value) =>
                  value == null || value === ""
                    ? ""
                    : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => {
                  const parsedValue = value?.replace(/,/g, "") ?? "";
                  return parsedValue === "" ? undefined : Number(parsedValue);
                }}
                onBlur={() => {
                  void handlePriceCommit();
                }}
                onPressEnter={() => {
                  void handlePriceCommit();
                }}
              />
            </Form.Item>

            <Form.Item
              name="currency"
              label={
                <span className="text-[16px] font-bold text-slate-800">
                  Tiền tệ
                </span>
              }
            >
              <Select
                className="h-10 premium-select"
                variant="outlined"
                options={[
                  { value: "VND", label: "VND" },
                  { value: "USD", label: "USD" },
                ]}
                onChange={(value) => {
                  void handleSelectCommit("currency")(value);
                }}
              />
            </Form.Item>
          </div>

          {/* Status */}
          <Form.Item
            name="status"
            label={
              <span className="text-[16px] font-bold text-slate-800">
                Trạng thái<span className="text-red-500 ml-1">*</span>
              </span>
            }
          >
            <Select
              className="h-10 premium-select"
              variant="outlined"
              options={[
                { value: "published", label: "Công khai" },
                { value: "private", label: "Riêng tư" },
              ]}
              onChange={(value) => {
                handleStatusChange(value);
              }}
            />
          </Form.Item>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
            <p className="text-[12px] leading-5 text-slate-500 italic">
              * Trạng thái &quot;Công khai&quot; cho phép mọi người xem thiệp
              qua đường link duy nhất. Trạng thái &quot;Riêng tư&quot; sẽ ẩn
              thiệp khỏi truy cập công khai.
            </p>
          </div>
        </Form>

        {/* Section: Invitation Thumbnail */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-[16px] font-bold text-slate-800">
              Template thumbnail
            </label>
            <button
              type="button"
              onClick={openUploadedImagesModal}
              className="text-xs font-medium text-primary hover:opacity-80 transition-colors"
            >
              Chọn ảnh
            </button>
          </div>
          <button
            type="button"
            onClick={openUploadedImagesModal}
            className="block w-full text-left"
          >
            <div
              className={`relative rounded-[18px] overflow-hidden aspect-[1.18/1] group shadow-sm transition ${
                hasThumbnail
                  ? "border border-slate-200 bg-slate-100 hover:border-primary/30 hover:shadow-md"
                  : "border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Ảnh thiệp"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <RiUploadCloudLine size={26} className="text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[15px] font-semibold text-slate-700">
                      Chưa có ảnh thiệp
                    </p>
                    <p className="text-[12px] leading-5 text-slate-400">
                      Mở thư viện để chọn ảnh hoặc tải ảnh mới lên.
                    </p>
                  </div>
                </div>
              )}
              {previewImageUrl && (
                <>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute left-4 top-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/85 backdrop-blur flex items-center justify-center shadow-lg">
                      <RiImageLine size={20} className="text-white" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
      <TemplateThumbnailModal
        open={isUploadedImagesModalOpen}
        uploadedImages={uploadedImages}
        loadingUploadedImages={loadingUploadedImages}
        uploadingImage={uploadingImage}
        selectedUrl={template?.thumbnailUrl ?? thumbnailPreviewUrl}
        emptyDescription="Tải ảnh lên ngay để dùng làm ảnh thiệp"
        onCancel={() => setIsUploadedImagesModalOpen(false)}
        onRefresh={() => {
          void loadUploadedImages();
        }}
        onUpload={(file) => {
          void handleThumbnailUpload(file);
        }}
        onSelect={(url) => {
          void handleThumbnailSelect(url);
        }}
      />
    </div>
  );
}

