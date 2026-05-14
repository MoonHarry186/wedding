  "use client";

import React from "react";
import { Input, Switch } from "antd";
import { RiBracesLine } from "@remixicon/react";
import type {
  CanvasElement,
  TemplateVariableSettings,
} from "@/types/editor";

function getTargetLabel(element: CanvasElement) {
  if (element.type === "text") return "Nội dung văn bản";
  if (element.type === "image") return "Ảnh / URL";
  if (element.type === "group") return "Nhóm phần tử";

  switch (element.widgetType) {
    case "calendar":
      return "Nội dung lịch";
    case "countdown":
      return "Nội dung đếm ngược";
    case "map":
      return "Địa chỉ bản đồ";
    case "video":
      return "URL video";
    case "qr_gift":
      return "Dữ liệu hộp quà";
    default:
      return "Dữ liệu phần tử";
  }
}

export function TemplateVariableSection({
  element,
  onChange,
}: {
  element: CanvasElement;
  onChange: (updates: Partial<TemplateVariableSettings>) => void;
}) {
  const variable = element.templateVariable || {
    enabled: false,
    key: "",
    label: "",
    description: "",
    required: false,
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <RiBracesLine size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-800">
              Dùng element này như một biến mẫu
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Phù hợp để gán nội dung động cho {getTargetLabel(element).toLowerCase()}.
            </p>
          </div>
        </div>
        <Switch
          checked={variable.enabled}
          onChange={(enabled) => onChange({ enabled })}
        />
      </div>

      {variable.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tên biến
            </label>
            <Input
              className="h-11 rounded-xl border-slate-200"
              placeholder="vd: bride_name, hero_image, wedding_map"
              value={variable.key}
              onChange={(e) => onChange({ key: e.target.value })}
            />
            <p className="text-[10px] text-slate-400">
              Biến sẽ được tham chiếu theo key này trong dữ liệu invitation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Nhãn hiển thị
            </label>
            <Input
              className="h-11 rounded-xl border-slate-200"
              placeholder="vd: Tên cô dâu, Ảnh bìa, Địa chỉ nhà hàng"
              value={variable.label}
              onChange={(e) => onChange({ label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Mô tả
            </label>
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              className="rounded-xl border-slate-200"
              placeholder="Giải thích ngắn cho người nhập dữ liệu sau này"
              value={variable.description}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-700">
                Bắt buộc nhập
              </div>
              <p className="text-[11px] text-slate-400">
                Đánh dấu nếu biến này là bắt buộc khi tạo invitation
              </p>
            </div>
            <Switch
              checked={Boolean(variable.required)}
              onChange={(required) => onChange({ required })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
