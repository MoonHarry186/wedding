"use client";

import React from "react";
import {
  DatePicker,
  TimePicker,
  Collapse,
  ColorPicker,
  Slider,
  InputNumber,
  Select,
} from "antd";
import { RiSettings4Line, RiMagicLine } from "@remixicon/react";
import type {
  CountdownWidgetConfig,
  CountdownWidgetElement,
} from "@/types/editor";
import { PaddingSection, BorderSection, ShadowSection } from "./CommonSettings";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

interface CountdownPanelProps {
  element: CountdownWidgetElement;
  onUpdate: (updates: Partial<CountdownWidgetElement>) => void;
}

export function CountdownPanel({ element, onUpdate }: CountdownPanelProps) {
  const config = element.config || {};
  const [activeTab, setActiveTab] = React.useState("settings");

  const updateConfig = (newConfig: Partial<CountdownWidgetConfig>) => {
    onUpdate({
      config: { ...config, ...newConfig },
    });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<CountdownWidgetElement["templateVariable"]>>,
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
              <span className="font-bold text-slate-700">
                Thiết lập đếm ngược
              </span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Chọn ngày
                  </label>
                  <DatePicker
                    className="w-full h-11 rounded-xl border-slate-200"
                    value={config.targetDate ? dayjs(config.targetDate) : null}
                    onChange={(date) => {
                      if (date) {
                        const currentTime = config.targetDate
                          ? dayjs(config.targetDate)
                          : dayjs();
                        const newDate = date
                          .hour(currentTime.hour())
                          .minute(currentTime.minute())
                          .second(0);
                        updateConfig({
                          targetDate: newDate.format("YYYY-MM-DD HH:mm:ss"),
                        });
                      }
                    }}
                    format="DD-MM-YYYY"
                  />
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Chọn giờ
                  </label>
                  <TimePicker
                    className="w-full h-11 rounded-xl border-slate-200"
                    value={config.targetDate ? dayjs(config.targetDate) : null}
                    onChange={(time) => {
                      if (time) {
                        const currentDate = config.targetDate
                          ? dayjs(config.targetDate)
                          : dayjs();
                        const newDate = currentDate
                          .hour(time.hour())
                          .minute(time.minute())
                          .second(0);
                        updateConfig({
                          targetDate: newDate.format("YYYY-MM-DD HH:mm:ss"),
                        });
                      }
                    }}
                    format="HH:mm"
                  />
                </div>

                {/* Direction */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Hướng hiển thị
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateConfig({ layout: "horizontal" })}
                      className={cn(
                        "flex-1 h-10 rounded-lg font-bold text-sm transition-all",
                        config.layout === "horizontal" || !config.layout
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      Ngang
                    </button>
                    <button
                      onClick={() => updateConfig({ layout: "vertical" })}
                      className={cn(
                        "flex-1 h-10 rounded-lg font-bold text-sm transition-all",
                        config.layout === "vertical"
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      Dọc
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ngôn ngữ
                  </label>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => updateConfig({ language: "vi" })}
                      className="flex items-center gap-2 group"
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          config.language === "vi" || !config.language
                            ? "border-primary ring-4 ring-primary/10"
                            : "border-slate-200",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            config.language === "vi" || !config.language
                              ? "bg-primary"
                              : "bg-transparent",
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Tiếng Việt
                      </span>
                    </button>
                    <button
                      onClick={() => updateConfig({ language: "en" })}
                      className="flex items-center gap-2 group"
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          config.language === "en"
                            ? "border-primary ring-4 ring-primary/10"
                            : "border-slate-200",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            config.language === "en"
                              ? "bg-primary"
                              : "bg-transparent",
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Tiếng Anh
                      </span>
                    </button>
                  </div>
                </div>

                {/* Spacing */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Khoảng cách (px)
                    </label>
                    <InputNumber
                      size="small"
                      value={config.spacing !== undefined ? config.spacing : 20}
                      onChange={(v) =>
                        updateConfig({ spacing: v ?? undefined })
                      }
                      className="w-16 rounded-lg"
                    />
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    value={config.spacing !== undefined ? config.spacing : 20}
                    onChange={(v) => updateConfig({ spacing: v })}
                    tooltip={{ open: false }}
                  />
                </div>

                {/* Detailed Settings */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Cài đặt giao diện
                  </h4>

                  {/* Font */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      Font
                    </span>
                    <Select
                      className="flex-1 max-w-[140px] premium-select-small"
                      value={config.fontFamily || "Inter"}
                      onChange={(v) => updateConfig({ fontFamily: v })}
                      options={[
                        { value: "Inter", label: "Inter" },
                        { value: "Arial", label: "Arial" },
                        { value: "Roboto", label: "Roboto" },
                      ]}
                    />
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-600">
                      Cỡ chữ
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          updateConfig({
                            fontSize: (config.fontSize || 14) - 1,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-l-lg text-slate-500"
                      >
                        -
                      </button>
                      <InputNumber
                        className="w-12 h-8 text-center border-y border-x-0 border-slate-200 rounded-none"
                        value={config.fontSize || 14}
                        onChange={(v) =>
                          updateConfig({ fontSize: v ?? undefined })
                        }
                        controls={false}
                      />
                      <button
                        onClick={() =>
                          updateConfig({
                            fontSize: (config.fontSize || 14) + 1,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-r-lg text-slate-500"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Màu chữ
                      </span>
                      <ColorPicker
                        value={config.textColor || "#fff"}
                        onChange={(c) =>
                          updateConfig({ textColor: c.toHexString() })
                        }
                        size="small"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Màu khung
                      </span>
                      <ColorPicker
                        value={config.borderColor || "#000"}
                        onChange={(c) =>
                          updateConfig({ borderColor: c.toHexString() })
                        }
                        size="small"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Màu nền
                      </span>
                      <ColorPicker
                        value={config.backgroundColor || "#0f172a"}
                        onChange={(c) =>
                          updateConfig({ backgroundColor: c.toHexString() })
                        }
                        size="small"
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
                        value={
                          config.opacity !== undefined ? config.opacity : 1
                        }
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
