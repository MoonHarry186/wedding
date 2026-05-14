"use client";

import React from "react";
import {
  Input,
  Collapse,
  Switch,
  Slider,
  InputNumber,
  ColorPicker,
} from "antd";
import { RiSettings4Line, RiMagicLine } from "@remixicon/react";
import type { VideoWidgetConfig, VideoWidgetElement } from "@/types/editor";
import { PaddingSection, BorderSection, ShadowSection } from "./CommonSettings";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

interface VideoPanelProps {
  element: VideoWidgetElement;
  onUpdate: (updates: Partial<VideoWidgetElement>) => void;
}

export function VideoPanel({ element, onUpdate }: VideoPanelProps) {
  const config = element.config || {};
  const [activeTab, setActiveTab] = React.useState("settings");

  const updateConfig = (newConfig: Partial<VideoWidgetConfig>) => {
    onUpdate({
      config: { ...config, ...newConfig },
    });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<VideoWidgetElement["templateVariable"]>>,
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
              <span className="font-bold text-slate-700">Thiết lập video</span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {/* YouTube URL */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    URL video YouTube
                  </label>
                  <Input
                    className="h-11 rounded-xl border-slate-200"
                    placeholder="https://www.youtube.com/watch?v..."
                    value={config.videoUrl || ""}
                    onChange={(e) => updateConfig({ videoUrl: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-400">
                    Dán link video YouTube hoặc ID video
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Tự động phát
                    </span>
                    <Switch
                      size="small"
                      checked={config.autoplay}
                      onChange={(v) => updateConfig({ autoplay: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Tắt tiếng
                    </span>
                    <Switch
                      size="small"
                      checked={config.muted}
                      onChange={(v) => updateConfig({ muted: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Hiển thị điều khiển
                    </span>
                    <Switch
                      size="small"
                      checked={config.controls !== false}
                      onChange={(v) => updateConfig({ controls: v })}
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

                {/* Background Color */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Màu nền
                  </span>
                  <ColorPicker
                    value={config.backgroundColor || "transparent"}
                    onChange={(c) =>
                      updateConfig({ backgroundColor: c.toHexString() })
                    }
                    size="small"
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
  );
}
