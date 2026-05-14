"use client";

import React from "react";
import {
  Input,
  Collapse,
  Select,
  Slider,
  InputNumber,
  Tooltip,
  Modal,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { RiSettings4Line, RiMagicLine } from "@remixicon/react";
import type { MapWidgetConfig, MapWidgetElement } from "@/types/editor";
import { PaddingSection, BorderSection, ShadowSection } from "./CommonSettings";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

interface MapPanelProps {
  element: MapWidgetElement;
  onUpdate: (updates: Partial<MapWidgetElement>) => void;
}

export function MapPanel({ element, onUpdate }: MapPanelProps) {
  const config = element.config || {};
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("settings");

  const updateConfig = (newConfig: Partial<MapWidgetConfig>) => {
    onUpdate({
      config: { ...config, ...newConfig },
    });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<MapWidgetElement["templateVariable"]>>,
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

  const settingsContent = (
    <div className="px-1 py-2 space-y-6">
      <Collapse
        ghost
        defaultActiveKey={["setup"]}
        expandIconPlacement="end"
        className="premium-collapse"
        items={[
          {
            key: "setup",
            label: (
              <span className="font-bold text-slate-700">Thiết lập bản đồ</span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="text-primary mr-1">*</span>Địa chỉ
                    </label>
                    <Tooltip title="Nhập địa chỉ hoặc link Google Maps">
                      <InfoCircleOutlined className="text-slate-400 text-xs" />
                    </Tooltip>
                  </div>
                  <Input
                    prefix={<span className="text-slate-400">📍</span>}
                    className="h-11 rounded-xl border-slate-200"
                    placeholder="zenlove thiệp cưới online"
                    value={config.address || ""}
                    onChange={(e) => updateConfig({ address: e.target.value })}
                  />
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="text-xs text-blue-500 italic hover:underline"
                  >
                    * Hướng dẫn nhập địa chỉ trong bản đồ
                  </button>
                </div>

                {/* Coordinates */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tọa độ bản đồ (Tùy chọn)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Latitude"
                      className="h-11 rounded-xl border-slate-200"
                      value={config.lat || ""}
                      onChange={(e) => updateConfig({ lat: e.target.value })}
                    />
                    <Input
                      placeholder="Longitude"
                      className="h-11 rounded-xl border-slate-200"
                      value={config.lng || ""}
                      onChange={(e) => updateConfig({ lng: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    💡 Tọa độ có thể tự động lấy từ địa chỉ hoặc nhập thủ công!
                  </p>
                </div>

                {/* Language & Zoom */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      Ngôn ngữ
                    </span>
                    <Select
                      className="flex-1 max-w-[140px] premium-select-small"
                      value={config.language || "vi"}
                      onChange={(v) => updateConfig({ language: v })}
                      options={[
                        { value: "vi", label: "Tiếng Việt" },
                        { value: "en", label: "Tiếng Anh" },
                      ]}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      Tỉ lệ Zoom
                    </span>
                    <InputNumber
                      className="w-full max-w-[140px] h-11 rounded-xl border-slate-200"
                      value={config.zoom || 15}
                      onChange={(v) => updateConfig({ zoom: v ?? undefined })}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Độ mờ
                    </span>
                    <InputNumber
                      size="small"
                      value={config.opacity !== undefined ? config.opacity : 1}
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
                    value={config.opacity !== undefined ? config.opacity : 1}
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

      {/* Guide Modal */}
      <Modal
        title="Hướng dẫn nhập dữ liệu bản đồ"
        open={isGuideOpen}
        onCancel={() => setIsGuideOpen(false)}
        footer={null}
        width={600}
        className="premium-modal"
      >
        <div className="space-y-6 text-sm text-slate-600">
          <p>Bạn có thể nhập một trong các định dạng sau:</p>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">1. Địa chỉ văn bản:</h4>
            <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs">
              Ví dụ: 1 P. Lương Yên, Bạch Đằng, Hai Bà Trưng, Hà Nội, Việt Nam
            </div>
            <p className="text-xs italic text-slate-400">
              Hệ thống sẽ tự động tìm tọa độ từ địa chỉ
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">
              2. Tọa độ (Latitude, Longitude):
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs space-y-1">
              <div>Ví dụ: 21.1173551,105.993476</div>
              <div>Hoặc: 21.1173551,105.993476,15z</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">3. Link Google Maps:</h4>
            <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs overflow-x-auto">
              https://www.google.com/maps/place/...
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl space-y-2 border border-blue-100">
            <h4 className="font-bold text-blue-800 flex items-center gap-2">
              💡 Lưu ý:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
              <li>Khi nhập tọa độ, hệ thống sẽ tự động lấy địa chỉ</li>
              <li>Khi nhập địa chỉ, hệ thống sẽ tự động lấy tọa độ</li>
              <li>Ưu tiên hiển thị theo tọa độ nếu có cả hai</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
