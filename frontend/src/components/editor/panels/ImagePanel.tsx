"use client";

import React from "react";
import {
  Select,
  InputNumber,
  Slider,
  ColorPicker,
  Collapse,
  Switch,
  Button,
  Tooltip,
} from "antd";
import {
  RiRefreshLine,
  RiArrowRightSLine,
  RiSettings4Line,
  RiMagicLine,
  RiLinksLine,
  RiCropLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { BorderOuterOutlined } from "@ant-design/icons";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";
import type {
  ImageElement,
  ShadowSettings,
  PaddingSettings,
} from "@/types/editor";
import { CropModal } from "@/components/editor/modals/CropModal";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { ElementEffectsPanel } from "./ElementEffectsPanel";
import { TemplateVariableSection } from "./TemplateVariableSection";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-premium-label block ml-1 mb-1">{children}</label>
);

const ShadowCard = ({
  element,
  type,
  label,
  onShadowChange,
}: {
  element: ImageElement;
  type: "boxShadow";
  label: string;
  onShadowChange: (key: "boxShadow", updates: Partial<ShadowSettings>) => void;
}) => {
  const shadow = element[type] || {
    enabled: false,
    color: "rgba(0,0,0,0.3)",
    blur: 10,
    offsetX: 0,
    offsetY: 4,
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
            <div
              className="w-24 h-12 bg-white rounded-lg"
              style={{
                boxShadow: `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`,
                border: "1px solid #f1f5f9",
              }}
            />
          </div>

          <div className="space-y-5">
            {[
              { label: "Horizontal Length", key: "offsetX", min: -50, max: 50 },
              { label: "Vertical Length", key: "offsetY", min: -50, max: 50 },
              { label: "Blur Radius", key: "blur", min: 0, max: 50 },
              { label: "Spread Radius", key: "spread", min: -20, max: 50 },
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

export function ImagePanel({ element }: { element: ImageElement }) {
  const {
    updateElement,
    pushHistory,
    panelActiveKeys,
    panelActiveTabs,
    setPanelActiveKeys,
    setPanelActiveTab,
    activePanel,
    setActivePanel,
    isCropModalOpen,
    setIsCropModalOpen,
    isReplacingImage,
    setIsReplacingImage,
  } = useEditorStore();

  const [isPaddingLinked, setIsPaddingLinked] = React.useState(true);
  const [isBorderRadiusLinked, setIsBorderRadiusLinked] = React.useState(true);

  const handleChange = (updates: Partial<ImageElement>) => {
    updateElement(element.id, updates);
  };

  const handleShadowChange = (
    key: "boxShadow",
    updates: Partial<ShadowSettings>,
  ) => {
    const current = element[key] || {
      enabled: false,
      color: "rgba(0,0,0,0.3)",
      blur: 10,
      offsetX: 0,
      offsetY: 4,
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

  const handleTemplateVariableChange = (
    updates: Partial<NonNullable<ImageElement["templateVariable"]>>,
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
        activeKey={panelActiveKeys["image"] || ["image"]}
        onChange={(keys) => setPanelActiveKeys("image", keys as string[])}
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
            key: "image",
            label: "Hình ảnh",
            children: (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Tooltip
                    title="Chọn ảnh từ thư viện để thay thế"
                    open={activePanel === "image"}
                    placement="left"
                  >
                    <button
                      onClick={() => {
                        setIsReplacingImage(true);
                        setActivePanel("image");
                      }}
                      className={cn(
                        "group w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all",
                        isReplacingImage
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-primary/30",
                      )}
                    >
                      <div className="p-3">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {element.url ? (
                            <img
                              src={element.url}
                              alt="Ảnh đang chọn"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <RiSettings4Line size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 pt-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <span>Ảnh đang chọn</span>
                            <RiRefreshLine
                              size={16}
                              className={cn(
                                "transition-colors",
                                isReplacingImage
                                  ? "text-primary"
                                  : "text-slate-400 group-hover:text-primary",
                              )}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Bấm để mở thư viện và thay ảnh
                          </p>
                        </div>
                      </div>
                    </button>
                  </Tooltip>
                </div>

                {/* Crop button */}
                {element.url && (
                  <div className="space-y-2">
                    <Button
                      icon={<RiCropLine size={15} />}
                      onClick={() => setIsCropModalOpen(true)}
                      className="w-full h-10 rounded-xl flex items-center justify-center gap-2 border-primary/20 text-primary hover:!border-primary hover:!text-primary"
                    >
                      Cắt ảnh
                      {element.cropData || element.clipShape ? " (đã cắt)" : ""}
                    </Button>
                    {(element.cropData || element.clipShape) && (
                      <Button
                        size="small"
                        icon={<RiDeleteBinLine size={13} />}
                        onClick={() => {
                          pushHistory("Xóa cắt ảnh");
                          updateElement(element.id, {
                            cropData: undefined,
                            clipShape: undefined,
                          });
                        }}
                        className="w-full rounded-lg text-slate-400 hover:!text-red-500 hover:!border-red-300"
                      >
                        Xóa cắt
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
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

                <div className="flex items-center justify-between py-2.5">
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
                      className={`flex-1 h-20 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        isPaddingLinked
                          ? "bg-primary/5 border-primary/20 text-primary"
                          : "bg-white/50 border-slate-100 text-slate-400"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <RiLinksLine
                          size={16}
                          className={
                            isPaddingLinked
                              ? "animate-in fade-in zoom-in duration-300"
                              : ""
                          }
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                          {isPaddingLinked ? "Tất cả" : "Hình ảnh"}
                        </span>
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
              <ShadowCard
                element={element}
                type="boxShadow"
                label="Đổ bóng"
                onShadowChange={handleShadowChange}
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
      loopCollapseActiveKeys={panelActiveKeys["image"] || []}
      onLoopCollapseChange={(keys) => setPanelActiveKeys("image", keys)}
    />
  );

  return (
    <div className="h-full flex flex-col pt-0">
      {isCropModalOpen && (
        <CropModal
          element={element}
          open={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
        />
      )}
      <EditorSegmentedPanel
        value={panelActiveTabs["image"] || "settings"}
        onChange={(tab) => setPanelActiveTab("image", tab)}
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
    </div>
  );
}
