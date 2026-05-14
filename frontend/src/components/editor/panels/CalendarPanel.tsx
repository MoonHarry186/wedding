"use client";

import React from "react";
import {
  DatePicker,
  Checkbox,
  Select,
  InputNumber,
  Slider,
  ColorPicker,
  Collapse,
} from "antd";
import {
  RiSettings4Line,
  RiMagicLine,
  RiAddLine,
  RiSubtractLine,
} from "@remixicon/react";
import type {
  CalendarWidgetConfig,
  CalendarWidgetElement,
} from "@/types/editor";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { PaddingSection, BorderSection, ShadowSection } from "./CommonSettings";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

interface CalendarPanelProps {
  element: CalendarWidgetElement;
  onUpdate: (updates: Partial<CalendarWidgetElement>) => void;
}

const CALENDAR_STYLES = [
  { id: "minimal", img: "https://zenlove.me/images/calendar-style-1.png" },
  { id: "modern", img: "https://zenlove.me/images/calendar-style-2.png" },
  { id: "classic", img: "https://zenlove.me/images/calendar-style-3.png" },
  { id: "fancy", img: "https://zenlove.me/images/calendar-style-4.png" },
];

const HEART_ICONS = [
  { id: "heart-1", icon: "❤️" },
  { id: "heart-2", icon: "💖" },
  { id: "heart-3", icon: "💕" },
  { id: "heart-4", icon: "💗" },
  { id: "heart-5", icon: "💘" },
  { id: "heart-6", icon: "💝" },
];

export function CalendarPanel({ element, onUpdate }: CalendarPanelProps) {
  const config = element.config || {};
  const [activeTab, setActiveTab] = React.useState("settings");

  const updateConfig = (newConfig: Partial<CalendarWidgetConfig>) => {
    onUpdate({
      config: { ...config, ...newConfig },
    });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<CalendarWidgetElement["templateVariable"]>>,
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

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      updateConfig({
        selectedDay: date.date(),
        month: date.month() + 1,
        year: date.year(),
        fullDate: date.format("YYYY-MM-DD"),
      });
    }
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
              <span className="font-bold text-slate-700">Thiết lập lịch</span>
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
                    value={config.fullDate ? dayjs(config.fullDate) : null}
                    onChange={handleDateChange}
                    format="DD-MM-YYYY"
                  />
                  <div className="pt-2">
                    <Checkbox
                      checked={config.showTwoDays}
                      onChange={(e) =>
                        updateConfig({ showTwoDays: e.target.checked })
                      }
                      className="text-sm font-medium text-slate-600"
                    >
                      Hiển thị 2 ngày
                    </Checkbox>
                  </div>
                  {config.showTwoDays && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                      <DatePicker
                        className="w-full h-11 rounded-xl border-slate-200"
                        value={
                          config.fullDate2 ? dayjs(config.fullDate2) : null
                        }
                        onChange={(date) => {
                          if (date) {
                            updateConfig({
                              selectedDay2: date.date(),
                              month2: date.month() + 1,
                              year2: date.year(),
                              fullDate2: date.format("YYYY-MM-DD"),
                            });
                          }
                        }}
                        format="DD-MM-YYYY"
                        placeholder="Chọn ngày thứ 2"
                      />
                    </div>
                  )}
                </div>

                {/* Giao diện */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Giao diện
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CALENDAR_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateConfig({ style: style.id })}
                        className={cn(
                          "aspect-square rounded-lg border-2 overflow-hidden transition-all",
                          config.style === style.id
                            ? "border-primary ring-2 ring-primary/10"
                            : "border-slate-100 hover:border-slate-200",
                        )}
                      >
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-[10px] text-slate-300">
                          {/* Placeholder for style preview */}
                          Style {style.id}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biểu tượng active */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Biểu tượng active
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateConfig({ activeIcon: null })}
                      className={cn(
                        "w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all",
                        !config.activeIcon
                          ? "border-primary bg-primary/5"
                          : "border-slate-100 bg-slate-50",
                      )}
                    >
                      <span className="text-xs font-bold text-slate-400">
                        Ko
                      </span>
                    </button>
                    {HEART_ICONS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateConfig({ activeIcon: item.icon })}
                        className={cn(
                          "w-9 h-9 rounded-lg border-2 flex items-center justify-center text-lg transition-all",
                          config.activeIcon === item.icon
                            ? "border-primary bg-primary/5"
                            : "border-slate-100 bg-white hover:border-slate-200",
                        )}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
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
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-l-lg text-slate-500 hover:text-primary"
                      >
                        <RiSubtractLine size={16} />
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
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-r-lg text-slate-500 hover:text-primary"
                      >
                        <RiAddLine size={16} />
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
                        value={config.textColor || "#333"}
                        onChange={(c) =>
                          updateConfig({ textColor: c.toHexString() })
                        }
                        size="small"
                      />
                    </div>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Màu chính
                      </span>
                      <ColorPicker
                        value={config.primaryColor || "#070235"}
                        onChange={(c) =>
                          updateConfig({ primaryColor: c.toHexString() })
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
                        step={0.01}
                        min={0}
                        max={1}
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
