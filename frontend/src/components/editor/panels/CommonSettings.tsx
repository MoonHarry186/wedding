"use client";

import React from "react";
import { InputNumber, Slider, ColorPicker, Switch, Select } from "antd";
import { RiLinksLine, RiArrowRightSLine } from "@remixicon/react";
import { BorderOuterOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import type {
  CanvasElement,
  PaddingSettings,
  BorderSettings,
  ShadowSettings,
} from "@/types/editor";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-premium-label block ml-1 mb-1">{children}</label>
);

export function PaddingSection({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (updates: any) => void;
}) {
  const [isLinked, setIsLinked] = React.useState(true);
  const padding = element.paddingSettings || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const handleChange = (side: keyof PaddingSettings, value: number) => {
    if (isLinked) {
      onUpdate({
        paddingSettings: {
          top: value,
          right: value,
          bottom: value,
          left: value,
        },
      });
    } else {
      onUpdate({
        paddingSettings: { ...padding, [side]: value },
      });
    }
  };

  return (
    <div className="flex justify-center py-2">
      <div className="w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-between">
        <InputNumber
          className="editor-input-small !bg-white shadow-sm"
          size="small"
          controls={false}
          value={padding.top}
          onChange={(v) => handleChange("top", v || 0)}
        />
        <div className="w-full flex items-center justify-between gap-3">
          <InputNumber
            className="editor-input-small !bg-white shadow-sm"
            size="small"
            controls={false}
            value={padding.left}
            onChange={(v) => handleChange("left", v || 0)}
          />
          <div
            onClick={() => setIsLinked(!isLinked)}
            className={cn(
              "flex-1 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all border",
              isLinked
                ? "bg-primary/5 border-primary/20 text-primary"
                : "bg-white border-slate-100 text-slate-400",
            )}
          >
            <RiLinksLine
              size={16}
              className={isLinked ? "animate-in zoom-in duration-300" : ""}
            />
          </div>
          <InputNumber
            className="editor-input-small !bg-white shadow-sm"
            size="small"
            controls={false}
            value={padding.right}
            onChange={(v) => handleChange("right", v || 0)}
          />
        </div>
        <InputNumber
          className="editor-input-small !bg-white shadow-sm"
          size="small"
          controls={false}
          value={padding.bottom}
          onChange={(v) => handleChange("bottom", v || 0)}
        />
      </div>
    </div>
  );
}

export function BorderSection({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (updates: any) => void;
}) {
  const border = element.border || {
    enabled: false,
    color: "#000000",
    width: 0,
    style: "solid",
  };
  const [isRadiusLinked, setIsRadiusLinked] = React.useState(true);

  const updateBorder = (updates: Partial<BorderSettings>) => {
    onUpdate({ border: { ...border, ...updates, enabled: true } });
  };

  const handleRadiusChange = (corner: string, value: number) => {
    if (isRadiusLinked) {
      updateBorder({
        radiusTopLeft: value,
        radiusTopRight: value,
        radiusBottomLeft: value,
        radiusBottomRight: value,
      });
    } else {
      updateBorder({ [corner]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Label>Kiểu viền</Label>
        <Select
          className="w-[120px]"
          value={border.style}
          onChange={(val) => updateBorder({ style: val })}
          options={[
            { value: "solid", label: "Liền" },
            { value: "dashed", label: "Đứt" },
            { value: "dotted", label: "Chấm" },
            { value: "double", label: "Viền đôi" },
          ]}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Kích thước</Label>
          <span className="text-xs font-bold text-slate-500">
            {border.width}px
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Slider
            className="flex-1"
            min={0}
            max={20}
            value={border.width}
            onChange={(v) => updateBorder({ width: v })}
            tooltip={{ open: false }}
          />
          <InputNumber
            size="small"
            className="w-16"
            min={0}
            max={20}
            value={border.width}
            onChange={(v) => updateBorder({ width: v || 0 })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-2.5">
        <Label>Màu viền</Label>
        <ColorPicker
          value={border.color}
          onChange={(c) => updateBorder({ color: c.toHexString() })}
          size="small"
        />
      </div>

      <div className="space-y-4">
        <Label>Bo góc</Label>
        <div className="w-full max-w-[200px] aspect-[16/9] mx-auto bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-2 flex flex-col justify-between">
          <div className="flex justify-between">
            <InputNumber
              className="editor-input-small"
              size="small"
              controls={false}
              value={border.radiusTopLeft || 0}
              onChange={(v) => handleRadiusChange("radiusTopLeft", v || 0)}
            />
            <InputNumber
              className="editor-input-small"
              size="small"
              controls={false}
              value={border.radiusTopRight || 0}
              onChange={(v) => handleRadiusChange("radiusTopRight", v || 0)}
            />
          </div>
          <div className="flex justify-center">
            <div
              onClick={() => setIsRadiusLinked(!isRadiusLinked)}
              className={cn(
                "w-16 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all",
                isRadiusLinked
                  ? "bg-primary/5 border-primary/20 text-primary"
                  : "bg-white border-slate-100 text-slate-300",
              )}
            >
              <RiLinksLine
                size={16}
                className={
                  isRadiusLinked ? "animate-in zoom-in duration-300" : ""
                }
              />
            </div>
          </div>
          <div className="flex justify-between">
            <InputNumber
              className="editor-input-small"
              size="small"
              controls={false}
              value={border.radiusBottomLeft || 0}
              onChange={(v) => handleRadiusChange("radiusBottomLeft", v || 0)}
            />
            <InputNumber
              className="editor-input-small"
              size="small"
              controls={false}
              value={border.radiusBottomRight || 0}
              onChange={(v) => handleRadiusChange("radiusBottomRight", v || 0)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShadowSection({
  element,
  onUpdate,
}: {
  element: CanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (updates: any) => void;
}) {
  const shadow = element.boxShadow || {
    enabled: false,
    color: "rgba(0,0,0,0.3)",
    blur: 10,
    offsetX: 0,
    offsetY: 4,
    spread: 0,
  };

  const updateShadow = (updates: Partial<ShadowSettings>) => {
    onUpdate({ boxShadow: { ...shadow, ...updates } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Kích hoạt đổ bóng</Label>
        <Switch
          size="small"
          checked={shadow.enabled}
          onChange={(v) => updateShadow({ enabled: v })}
        />
      </div>

      {shadow.enabled && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {[
            { label: "Độ lệch X", key: "offsetX", min: -50, max: 50 },
            { label: "Độ lệch Y", key: "offsetY", min: -50, max: 50 },
            { label: "Độ mờ", key: "blur", min: 0, max: 50 },
            { label: "Độ rộng", key: "spread", min: -20, max: 50 },
          ].map((item) => (
            <div key={item.key}>
              <div className="flex justify-between items-center mb-1">
                <Label>{item.label}</Label>
                <span className="text-xs font-bold text-slate-500">
                  {shadow[item.key as keyof ShadowSettings] || 0}px
                </span>
              </div>
              <Slider
                min={item.min}
                max={item.max}
                value={
                  (shadow[item.key as keyof ShadowSettings] as number) || 0
                }
                onChange={(v) => updateShadow({ [item.key]: v })}
                tooltip={{ open: false }}
              />
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <Label>Màu đổ bóng</Label>
            <ColorPicker
              value={shadow.color}
              onChange={(c) => updateShadow({ color: c.toHexString() })}
              size="small"
            />
          </div>
        </div>
      )}
    </div>
  );
}

