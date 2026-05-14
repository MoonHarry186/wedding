"use client";

import React from "react";
import {
  Input,
  Select,
  InputNumber,
  Slider,
  Radio,
  ColorPicker,
  Collapse,
  Switch,
  Button,
} from "antd";
import {
  RiArrowRightSLine,
  RiAddLine,
  RiSubtractLine,
  RiSettings4Line,
  RiMagicLine,
  RiLinksLine,
  RiSearchLine,
  RiArrowLeftLine,
  RiFontFamily,
} from "@remixicon/react";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuFoldOutlined,
  BorderOuterOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editor.store";
import type {
  TextElement,
  ShadowSettings,
  PaddingSettings,
} from "@/types/editor";
import { cn } from "@/lib/utils";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { resolveFontFamily } from "@/lib/editorFonts";
import { TemplateVariableSection } from "./TemplateVariableSection";

const FONT_FAMILIES = [
  {
    label: "Chữ viết tay",
    options: [
      { value: "Dancing Script", label: "Dancing Script" },
      { value: "Great Vibes", label: "Great Vibes" },
      { value: "Sacramento", label: "Sacramento" },
      { value: "Parisienne", label: "Parisienne" },
      { value: "Alex Brush", label: "Alex Brush" },
      { value: "Allura", label: "Allura" },
      { value: "Pinyon Script", label: "Pinyon Script" },
      { value: "Tangerine", label: "Tangerine" },
      { value: "Euphoria Script", label: "Euphoria Script" },
      { value: "Imperial Script", label: "Imperial Script" },
      { value: "Petit Formal Script", label: "Petit Formal Script" },
      { value: "Luxurious Script", label: "Luxurious Script" },
      { value: "Mrs Saint Delafield", label: "Mrs Saint Delafield" },
      { value: "Satisfy", label: "Satisfy" },
      { value: "Love Light", label: "Love Light" },
    ],
  },
  {
    label: "Serif sang trọng",
    options: [
      { value: "Cormorant Garamond", label: "Cormorant Garamond" },
      { value: "Cormorant", label: "Cormorant" },
      { value: "Playfair Display", label: "Playfair Display" },
      { value: "EB Garamond", label: "EB Garamond" },
      { value: "Cinzel", label: "Cinzel" },
      { value: "Cinzel Decorative", label: "Cinzel Decorative" },
      { value: "Bodoni Moda", label: "Bodoni Moda" },
      { value: "Libre Baskerville", label: "Libre Baskerville" },
      { value: "Lora", label: "Lora" },
      { value: "Merriweather", label: "Merriweather" },
      { value: "Gloock", label: "Gloock" },
      { value: "DM Serif Display", label: "DM Serif Display" },
      { value: "Instrument Serif", label: "Instrument Serif" },
      { value: "Young Serif", label: "Young Serif" },
      { value: "Crimson Pro", label: "Crimson Pro" },
      { value: "Noto Serif", label: "Noto Serif" },
    ],
  },
  {
    label: "Sans-serif hiện đại",
    options: [
      { value: "Inter", label: "Inter" },
      { value: "Montserrat", label: "Montserrat" },
      { value: "Raleway", label: "Raleway" },
      { value: "Lato", label: "Lato" },
      { value: "Josefin Sans", label: "Josefin Sans" },
      { value: "DM Sans", label: "DM Sans" },
      { value: "Work Sans", label: "Work Sans" },
      { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
      { value: "Nunito Sans", label: "Nunito Sans" },
      { value: "Instrument Sans", label: "Instrument Sans" },
    ],
  },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-premium-label block ml-1 mb-1">{children}</label>
);

const ShadowCard = ({
  element,
  type,
  label,
  onShadowChange,
}: {
  element: TextElement;
  type: "textShadow" | "boxShadow";
  label: string;
  onShadowChange: (
    key: "textShadow" | "boxShadow",
    updates: Partial<ShadowSettings>,
  ) => void;
}) => {
  const shadow = element[type] || {
    enabled: false,
    color: "rgba(0,0,0,0.3)",
    blur: 4,
    offsetX: 2,
    offsetY: 2,
    spread: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Switch
          size="middle"
          checked={shadow.enabled}
          onChange={(val) => onShadowChange(type, { enabled: val })}
          className={shadow.enabled ? "!bg-primary" : ""}
        />
      </div>

      {shadow.enabled && (
        <>
          {/* Visual Preview */}
          <div className="flex justify-center py-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
            {type === "textShadow" ? (
              <div
                className="text-4xl font-black text-white"
                style={{
                  textShadow: `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`,
                  color: element.color || "#000000",
                }}
              >
                Ab
              </div>
            ) : (
              <div
                className="w-24 h-12 bg-white rounded-lg"
                style={{
                  boxShadow: `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`,
                  border: "1px solid #f1f5f9",
                }}
              />
            )}
          </div>

          <div className="space-y-5">
            {[
              { label: "Horizontal Length", key: "offsetX", min: -50, max: 50 },
              { label: "Vertical Length", key: "offsetY", min: -50, max: 50 },
              { label: "Blur Radius", key: "blur", min: 0, max: 50 },
              ...(type === "boxShadow"
                ? [{ label: "Spread Radius", key: "spread", min: -20, max: 50 }]
                : []),
            ].map((item) => (
              <div key={item.key}>
                <div className="flex justify-between items-center mb-1">
                  <Label>{item.label}</Label>
                  <span className="text-[12px] font-bold text-slate-500">
                    {shadow[item.key as keyof ShadowSettings] || 0}px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    className="flex-1"
                    min={item.min}
                    max={item.max}
                    value={
                      (shadow[item.key as keyof ShadowSettings] as number) || 0
                    }
                    onChange={(val) =>
                      onShadowChange(type, { [item.key]: val })
                    }
                    tooltip={{ open: false }}
                    trackStyle={{ backgroundColor: "var(--color-primary)" }}
                    handleStyle={{ borderColor: "var(--color-primary)" }}
                  />
                  <InputNumber
                    className="w-[60px] text-center font-bold rounded-lg"
                    size="small"
                    min={item.min}
                    max={item.max}
                    value={
                      (shadow[item.key as keyof ShadowSettings] as number) || 0
                    }
                    onChange={(val) =>
                      onShadowChange(type, { [item.key]: val || 0 })
                    }
                    controls={false}
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between py-2">
              <Label>Màu đổ bóng</Label>
              <ColorPicker
                value={shadow.color}
                onChange={(color) =>
                  onShadowChange(type, { color: color.toHexString() })
                }
                size="small"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LinkCard = ({
  element,
  handleLinkChange,
  handleChange,
}: {
  element: TextElement;
  handleLinkChange: (
    updates: Partial<{ url: string; target: "_blank" | "_self" }>,
  ) => void;
  handleChange: (updates: Partial<TextElement>) => void;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>URL liên kết</Label>
      <Input
        placeholder="https://..."
        value={element.link?.url}
        onChange={(e) => handleLinkChange({ url: e.target.value })}
        className="h-10"
        prefix={<RiLinksLine size={16} className="text-slate-400" />}
      />
    </div>
    <div className="flex items-center justify-between">
      <Label>Mở trong tab mới</Label>
      <Switch
        size="small"
        checked={element.link?.target === "_blank"}
        onChange={(val) =>
          handleLinkChange({ target: val ? "_blank" : "_self" })
        }
        className={element.link?.target === "_blank" ? "!bg-primary" : ""}
      />
    </div>
    <div className="pt-2">
      <Button
        danger
        type="dashed"
        className="w-full"
        onClick={() => handleChange({ link: undefined })}
      >
        Gỡ bỏ liên kết
      </Button>
    </div>
  </div>
);

export function TextPanel({ element }: { element: TextElement }) {
  const {
    updateElement,
    panelActiveKeys,
    panelActiveTabs,
    setPanelActiveKeys,
    setPanelActiveTab,
  } = useEditorStore();
  const [isPaddingLinked, setIsPaddingLinked] = React.useState(true);
  const [isBorderRadiusLinked, setIsBorderRadiusLinked] = React.useState(true);
  const [showFontPanel, setShowFontPanel] = React.useState(false);
  const [fontSearch, setFontSearch] = React.useState("");

  const filteredFonts = React.useMemo(() => {
    if (!fontSearch) return FONT_FAMILIES;

    const searchLower = fontSearch.toLowerCase();
    return FONT_FAMILIES.map((group) => ({
      ...group,
      options: group.options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchLower) ||
          opt.value.toLowerCase().includes(searchLower),
      ),
    })).filter((group) => group.options.length > 0);
  }, [fontSearch]);

  const handleChange = (updates: Partial<TextElement>) => {
    updateElement(element.id, updates);
  };

  const handleShadowChange = (
    key: "textShadow" | "boxShadow",
    updates: Partial<ShadowSettings>,
  ) => {
    const current = element[key] || {
      enabled: false,
      color: "rgba(0,0,0,0.3)",
      blur: 4,
      offsetX: 2,
      offsetY: 2,
      spread: 0,
    };
    updateElement(element.id, {
      [key]: { ...current, ...updates },
    });
  };

  const handlePaddingChange = (side: keyof PaddingSettings, value: number) => {
    const current = element.paddingSettings || {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
    if (isPaddingLinked) {
      handleChange({
        paddingSettings: {
          top: value,
          right: value,
          bottom: value,
          left: value,
        },
      });
    } else {
      handleChange({
        paddingSettings: { ...current, [side]: value },
      });
    }
  };

  const handleBorderRadiusChange = (
    corner:
      | "radiusTopLeft"
      | "radiusTopRight"
      | "radiusBottomLeft"
      | "radiusBottomRight",
    value: number,
  ) => {
    const current = element.border || {
      enabled: false,
      color: "#000000",
      width: 1,
      style: "solid",
    };
    if (isBorderRadiusLinked) {
      handleChange({
        border: {
          ...current,
          radiusTopLeft: value,
          radiusTopRight: value,
          radiusBottomLeft: value,
          radiusBottomRight: value,
        },
      });
    } else {
      handleChange({
        border: { ...current, [corner]: value },
      });
    }
  };

  const handleLinkChange = (
    updates: Partial<{ url: string; target: "_blank" | "_self" }>,
  ) => {
    const current = element.link || { url: "", target: "_self" };
    handleChange({ link: { ...current, ...updates } });
  };

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<TextElement["templateVariable"]>>,
  ) => {
    handleChange({
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

  const SettingsTab = () => (
    <div className="space-y-2 pt-2">
      <Collapse
        activeKey={panelActiveKeys["text"] || ["typography"]}
        onChange={(keys) => setPanelActiveKeys("text", keys as string[])}
        expandIconPlacement="start"
        className="editor-collapse"
        expandIcon={({ isActive }) => (
          <RiArrowRightSLine
            size={18}
            className={`transition-transform text-slate-300 ${isActive ? "rotate-90" : ""}`}
          />
        )}
        items={[
          {
            key: "typography",
            label: "Kiểu chữ",
            children: (
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {[
                    {
                      icon: BoldOutlined,
                      key: "fontWeight",
                      val: "bold",
                      active:
                        element.fontWeight === "bold" ||
                        element.fontWeight === 700,
                    },
                    {
                      icon: ItalicOutlined,
                      key: "fontStyle",
                      val: "italic",
                      active: element.fontStyle === "italic",
                    },
                    {
                      icon: UnderlineOutlined,
                      key: "textDecoration",
                      val: "underline",
                      active: element.textDecoration === "underline",
                    },
                    {
                      icon: StrikethroughOutlined,
                      key: "textDecoration",
                      val: "line-through",
                      active: element.textDecoration === "line-through",
                    },
                    {
                      icon: FontSizeOutlined,
                      key: "textTransform",
                      val: "uppercase",
                      active: element.textTransform === "uppercase",
                    },
                  ].map((btn, i) => (
                    <Button
                      key={i}
                      size="middle"
                      type={btn.active ? "primary" : "default"}
                      icon={
                        typeof btn.icon === "function"
                          ? btn.icon({ size: 18 })
                          : React.createElement(btn.icon, {
                              style: { fontSize: "18px" },
                            })
                      }
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const updates: any = {};
                        if (btn.key === "fontWeight")
                          updates[btn.key] = btn.active ? 400 : "bold";
                        else if (btn.key === "fontStyle")
                          updates[btn.key] = btn.active ? "normal" : "italic";
                        else if (btn.key === "textDecoration")
                          updates[btn.key] = btn.active ? "none" : btn.val;
                        else if (btn.key === "textTransform")
                          updates[btn.key] = btn.active ? "none" : "uppercase";
                        handleChange(updates);
                      }}
                      className="aspect-square h-auto flex items-center justify-center p-0"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Label>Căn chỉnh</Label>
                  <Radio.Group
                    value={element.textAlign}
                    onChange={(e) =>
                      handleChange({ textAlign: e.target.value })
                    }
                    optionType="button"
                    size="middle"
                  >
                    <Radio.Button value="left">
                      <AlignLeftOutlined style={{ fontSize: "16px" }} />
                    </Radio.Button>
                    <Radio.Button value="center">
                      <AlignCenterOutlined style={{ fontSize: "16px" }} />
                    </Radio.Button>
                    <Radio.Button value="right">
                      <AlignRightOutlined style={{ fontSize: "16px" }} />
                    </Radio.Button>
                    <Radio.Button value="justify">
                      <MenuFoldOutlined style={{ fontSize: "16px" }} />
                    </Radio.Button>
                  </Radio.Group>
                </div>

                <div className="space-y-1">
                  <Label>Phông chữ</Label>
                  <button
                    onClick={() => setShowFontPanel(true)}
                    className="w-full flex items-center justify-between px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <RiFontFamily
                        size={18}
                        className="text-slate-400 group-hover:text-primary"
                      />
                      <span
                        className="font-medium text-slate-700 editor-font-preview"
                        style={
                          {
                            "--preview-font-family": resolveFontFamily(
                              element.fontFamily,
                            ),
                          } as React.CSSProperties
                        }
                      >
                        {element.fontFamily}
                      </span>
                    </div>
                    <RiArrowRightSLine
                      size={18}
                      className="text-slate-300 group-hover:text-primary/70"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label>Cỡ chữ</Label>
                  <div className="editor-step-input h-[38px] w-[140px]">
                    <Button
                      type="text"
                      icon={<RiSubtractLine size={14} />}
                      onClick={() =>
                        handleChange({
                          fontSize: Math.max(1, element.fontSize - 1),
                        })
                      }
                      className="h-full px-2"
                    />
                    <InputNumber
                      className="flex-1 text-center font-bold"
                      value={element.fontSize}
                      onChange={(val) => handleChange({ fontSize: val || 12 })}
                      controls={false}
                    />
                    <Button
                      type="text"
                      icon={<RiAddLine size={14} />}
                      onClick={() =>
                        handleChange({ fontSize: element.fontSize + 1 })
                      }
                      className="h-full px-2"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 py-1">
                  <Label>Độ mờ</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      className="flex-1"
                      min={0}
                      max={1}
                      step={0.01}
                      value={element.opacity}
                      onChange={(val) => handleChange({ opacity: val })}
                      tooltip={{ open: false }}
                    />
                    <InputNumber
                      className="w-[70px] text-center font-bold"
                      min={0}
                      max={1}
                      step={0.01}
                      value={element.opacity}
                      onChange={(val) => handleChange({ opacity: val ?? 1 })}
                      precision={2}
                      controls={false}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label>Giãn chữ</Label>
                  <div className="editor-step-input h-[38px] w-[140px]">
                    <Button
                      type="text"
                      icon={<RiSubtractLine size={14} />}
                      onClick={() =>
                        handleChange({
                          letterSpacing: Math.max(
                            -5,
                            (element.letterSpacing || 0) - 0.1,
                          ),
                        })
                      }
                      className="h-full px-2"
                    />
                    <InputNumber
                      className="flex-1 text-center font-bold"
                      value={element.letterSpacing || 0}
                      min={-5}
                      max={20}
                      step={0.1}
                      onChange={(val) =>
                        handleChange({ letterSpacing: val ?? 0 })
                      }
                      controls={false}
                    />
                    <Button
                      type="text"
                      icon={<RiAddLine size={14} />}
                      onClick={() =>
                        handleChange({
                          letterSpacing: Math.min(
                            20,
                            (element.letterSpacing || 0) + 0.1,
                          ),
                        })
                      }
                      className="h-full px-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label>Chiều cao dòng</Label>
                  <div className="editor-step-input h-[38px] w-[140px]">
                    <Button
                      type="text"
                      icon={<RiSubtractLine size={14} />}
                      onClick={() =>
                        handleChange({
                          lineHeight: Math.max(0.8, (element.lineHeight || 1.2) - 0.1),
                        })
                      }
                      className="h-full px-2"
                    />
                    <InputNumber
                      className="flex-1 text-center font-bold"
                      value={element.lineHeight || 1.2}
                      min={0.8}
                      max={3}
                      step={0.1}
                      onChange={(val) =>
                        handleChange({ lineHeight: val ?? 1.2 })
                      }
                      controls={false}
                    />
                    <Button
                      type="text"
                      icon={<RiAddLine size={14} />}
                      onClick={() =>
                        handleChange({
                          lineHeight: Math.min(3, (element.lineHeight || 1.2) + 0.1),
                        })
                      }
                      className="h-full px-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <Label>Màu chữ</Label>
                  <ColorPicker
                    value={element.color}
                    onChange={(color) =>
                      handleChange({ color: color.toHexString() })
                    }
                    size="small"
                  />
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <Label>Màu nền</Label>
                  <ColorPicker
                    value={element.backgroundColor || "#ffffff"}
                    onChange={(color) =>
                      handleChange({ backgroundColor: color.toHexString() })
                    }
                    size="small"
                  />
                </div>
              </div>
            ),
          },
          {
            key: "padding",
            label: "Khoảng đệm",
            children: (
              <div className="flex justify-center py-2">
                <div className="w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-between">
                  <InputNumber
                    className="editor-input-small !bg-white shadow-sm"
                    size="small"
                    controls={false}
                    value={element.paddingSettings?.top || 0}
                    onChange={(v) => handlePaddingChange("top", v || 0)}
                  />
                  <div className="w-full flex items-center justify-between gap-3">
                    <InputNumber
                      className="editor-input-small !bg-white shadow-sm"
                      size="small"
                      controls={false}
                      value={element.paddingSettings?.left || 0}
                      onChange={(v) => handlePaddingChange("left", v || 0)}
                    />
                    <div
                      onClick={() => setIsPaddingLinked(!isPaddingLinked)}
                      className={`flex-1 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all`}
                    >
                      <div
                        className={`flex flex-col items-center gap-1 border p-2 rounded-lg ${
                          isPaddingLinked
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-white/50 border-slate-100 text-slate-400"
                        }`}
                      >
                        <RiLinksLine
                          size={16}
                          className={
                            isPaddingLinked
                              ? "animate-in fade-in zoom-in duration-300 bg-primary/5 border-primary/20 text-primary"
                              : "bg-white/50 border-slate-100 text-slate-400"
                          }
                        />
                      </div>
                    </div>
                    <InputNumber
                      className="editor-input-small !bg-white shadow-sm"
                      size="small"
                      controls={false}
                      value={element.paddingSettings?.right || 0}
                      onChange={(v) => handlePaddingChange("right", v || 0)}
                    />
                  </div>
                  <InputNumber
                    className="editor-input-small !bg-white shadow-sm"
                    size="small"
                    controls={false}
                    value={element.paddingSettings?.bottom || 0}
                    onChange={(v) => handlePaddingChange("bottom", v || 0)}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "border",
            label: "Đường viền",
            children: (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <Label>Kiểu viền</Label>
                  <Select
                    className="w-[120px]"
                    value={element.border?.style || "solid"}
                    getPopupContainer={() => document.body}
                    onChange={(val) =>
                      handleChange({
                        border: {
                          ...(element.border || {
                            enabled: true,
                            color: "#000000",
                            width: 1,
                          }),
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style: val as any,
                        },
                      })
                    }
                    options={[
                      { value: "solid", label: "Liền" },
                      { value: "dashed", label: "Đứt" },
                      { value: "dotted", label: "Chấm" },
                      { value: "double", label: "Viền đôi" },
                    ]}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Kích thước</Label>
                    <span className="text-[12px] font-bold text-slate-500">
                      {element.border?.width || 0}px
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      className="flex-1"
                      min={0}
                      max={20}
                      value={element.border?.width || 0}
                      onChange={(val) =>
                        handleChange({
                          border: {
                            ...(element.border || {
                              enabled: true,
                              style: "solid",
                              color: "#000000",
                            }),
                            width: val,
                          },
                        })
                      }
                      tooltip={{ open: false }}
                    />
                    <InputNumber
                      className="w-[60px]"
                      size="small"
                      min={0}
                      max={20}
                      value={element.border?.width || 0}
                      onChange={(val) =>
                        handleChange({
                          border: {
                            ...(element.border || {
                              enabled: true,
                              style: "solid",
                              color: "#000000",
                            }),
                            width: val || 0,
                          },
                        })
                      }
                      controls={false}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Vị trí</Label>
                  <div className="border-selector-container">
                    {/* Center Button: All Sides */}
                    <div
                      className={`border-center-btn ${element.border?.sides?.length === 4 || !element.border?.sides ? "active" : ""}`}
                      onClick={() => {
                        const isAllSelected =
                          element.border?.sides?.length === 4 ||
                          !element.border?.sides;
                        handleChange({
                          border: {
                            ...(element.border || {
                              enabled: true,
                              style: "solid",
                              color: "#000000",
                              width: 1,
                            }),
                            sides: isAllSelected
                              ? []
                              : ["top", "right", "bottom", "left"],
                          },
                        });
                      }}
                    >
                      <BorderOuterOutlined />
                    </div>

                    {/* Side Buttons */}
                    {[
                      { key: "top", class: "border-side-top" },
                      { key: "bottom", class: "border-side-bottom" },
                      { key: "left", class: "border-side-left" },
                      { key: "right", class: "border-side-right" },
                    ].map((side) => {
                      const isActive =
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        element.border?.sides?.includes(side.key as any) ??
                        !element.border?.sides; // Default is all sides if no sides array exists

                      return (
                        <div
                          key={side.key}
                          className={`border-side-btn ${side.class} ${isActive ? "active" : ""}`}
                          onClick={() => {
                            let newSides: (
                              | "top"
                              | "right"
                              | "bottom"
                              | "left"
                            )[] = element.border?.sides
                              ? [...element.border.sides]
                              : ["top", "right", "bottom", "left"];

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const s = side.key as any;
                            if (newSides.includes(s)) {
                              newSides = newSides.filter((x) => x !== s);
                            } else {
                              newSides.push(s);
                            }

                            handleChange({
                              border: {
                                ...(element.border || {
                                  enabled: true,
                                  style: "solid",
                                  color: "#000000",
                                  width: 1,
                                }),
                                sides: newSides,
                              },
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <Label>Màu viền</Label>
                  <ColorPicker
                    value={element.border?.color || "#000000"}
                    onChange={(color) =>
                      handleChange({
                        border: {
                          ...(element.border || {
                            enabled: true,
                            style: "solid",
                            width: 1,
                          }),
                          color: color.toHexString(),
                        },
                      })
                    }
                    size="small"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Bo góc</Label>
                  <div className="w-full max-w-[200px] aspect-[16/9] mx-auto bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <InputNumber
                        className="editor-input-small !bg-white shadow-sm"
                        size="small"
                        controls={false}
                        placeholder="0"
                        value={element.border?.radiusTopLeft || 0}
                        onChange={(v) =>
                          handleBorderRadiusChange("radiusTopLeft", v || 0)
                        }
                      />
                      <InputNumber
                        className="editor-input-small !bg-white shadow-sm"
                        size="small"
                        controls={false}
                        placeholder="0"
                        value={element.border?.radiusTopRight || 0}
                        onChange={(v) =>
                          handleBorderRadiusChange("radiusTopRight", v || 0)
                        }
                      />
                    </div>
                    <div className="flex justify-center">
                      <div
                        onClick={() =>
                          setIsBorderRadiusLinked(!isBorderRadiusLinked)
                        }
                        className={`w-16 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                          isBorderRadiusLinked
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-white border-slate-100 text-slate-300"
                        }`}
                      >
                        <RiLinksLine
                          size={16}
                          className={
                            isBorderRadiusLinked
                              ? "animate-in fade-in zoom-in duration-300"
                              : ""
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <InputNumber
                        className="editor-input-small !bg-white shadow-sm"
                        size="small"
                        controls={false}
                        placeholder="0"
                        value={element.border?.radiusBottomLeft || 0}
                        onChange={(v) =>
                          handleBorderRadiusChange("radiusBottomLeft", v || 0)
                        }
                      />
                      <InputNumber
                        className="editor-input-small !bg-white shadow-sm"
                        size="small"
                        controls={false}
                        placeholder="0"
                        value={element.border?.radiusBottomRight || 0}
                        onChange={(v) =>
                          handleBorderRadiusChange("radiusBottomRight", v || 0)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "shadow",
            label: "Đổ bóng",
            children: (
              <div className="space-y-6">
                <ShadowCard
                  element={element}
                  type="textShadow"
                  label="Đổ bóng văn bản"
                  onShadowChange={handleShadowChange}
                />
                <div className="border-t border-slate-100 my-2" />
                <ShadowCard
                  element={element}
                  type="boxShadow"
                  label="Đổ bóng khối"
                  onShadowChange={handleShadowChange}
                />
              </div>
            ),
          },
          {
            key: "link",
            label: "Liên kết",
            children: (
              <LinkCard
                element={element}
                handleLinkChange={handleLinkChange}
                handleChange={handleChange}
              />
            ),
          },
          {
            key: "advanced",
            label: "Nâng cao",
            children: (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Rộng</Label>
                  <InputNumber
                    className="w-full rounded-lg"
                    value={Math.round(element.width)}
                    onChange={(val) => handleChange({ width: val || 100 })}
                    suffix="px"
                  />
                </div>
                <div className="space-y-1">
                  <Label>X</Label>
                  <InputNumber
                    className="w-full rounded-lg"
                    value={Math.round(element.x)}
                    onChange={(val) => handleChange({ x: val || 0 })}
                    suffix="px"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Y</Label>
                  <InputNumber
                    className="w-full rounded-lg"
                    value={Math.round(element.y)}
                    onChange={(val) => handleChange({ y: val || 0 })}
                    suffix="px"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Xoay</Label>
                  <InputNumber
                    className="w-full rounded-lg"
                    value={Math.round(element.rotation)}
                    onChange={(val) => handleChange({ rotation: val || 0 })}
                    suffix="°"
                  />
                </div>
              </div>
            ),
          },
          {
            key: "variable",
            label: "Biến mẫu",
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
      onUpdate={handleChange}
      subjectLabel="phần tử"
      loopCollapseActiveKeys={panelActiveKeys["text"] || []}
      onLoopCollapseChange={(keys) => setPanelActiveKeys("text", keys)}
    />
  );

  return (
    <div className="h-full flex flex-col pt-0">
      <EditorSegmentedPanel
        value={panelActiveTabs["text"] || "settings"}
        onChange={(tab) => setPanelActiveTab("text", tab)}
        items={[
          {
            key: "settings",
            label: "Cài đặt",
            icon: <RiSettings4Line size={16} />,
            content: <div className="px-1 py-2">{SettingsTab()}</div>,
          },
          {
            key: "effects",
            label: "Hiệu ứng",
            icon: <RiMagicLine size={16} />,
            content: effectsContent,
          },
        ]}
      />

      {/* Font Slide Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-[500px] bg-white z-[2000] flex flex-col transition-all duration-300 ease-in-out shadow-[-10px_0_30px_rgba(0,0,0,0.15)] border-l border-slate-200",
          showFontPanel
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none",
        )}
      >
        {/* Optional Backdrop to prevent interaction with canvas while font picking */}
        {showFontPanel && (
          <div
            className="fixed inset-0 bg-slate-900/5 backdrop-blur-[1px] -z-10 transition-opacity duration-300"
            onClick={() => setShowFontPanel(false)}
          />
        )}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-white sticky top-0 z-10">
          <Button
            type="text"
            icon={<RiArrowLeftLine size={20} />}
            onClick={() => setShowFontPanel(false)}
            className="hover:bg-slate-50 flex items-center justify-center"
          />
          <span className="font-bold text-slate-800">Chọn phông chữ</span>
        </div>

        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <Input
            placeholder="Tìm kiếm phông chữ..."
            value={fontSearch}
            onChange={(e) => setFontSearch(e.target.value)}
            allowClear
            prefix={<RiSearchLine size={16} className="text-slate-400" />}
            className="h-10 rounded-xl shadow-sm border-slate-200"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {filteredFonts.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <RiFontFamily size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium">
                Không tìm thấy phông chữ nào
              </p>
            </div>
          ) : (
            filteredFonts.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
                  {group.label}
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {group.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleChange({ fontFamily: opt.value });
                        setShowFontPanel(false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={cn(
                        "w-full text-left px-4 py-4 rounded-xl transition-all flex items-center justify-between group border-2",
                        element.fontFamily === opt.value
                          ? "bg-primary/5 text-primary border-primary/10 shadow-sm"
                          : "hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-100",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-slate-400 transition-colors">
                          {opt.value}
                        </span>
                        <span
                          className="editor-font-preview"
                          style={
                            {
                              "--preview-font-family":
                                resolveFontFamily(opt.value),
                              fontSize: "22px",
                              lineHeight: "1.2",
                            } as React.CSSProperties
                          }
                        >
                          {opt.label}
                        </span>
                      </div>
                      {element.fontFamily === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(7,2,53,0.35)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
