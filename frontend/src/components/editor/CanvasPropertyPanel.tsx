import React from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { Select, Divider, InputNumber, Space } from "antd";

export const BACKGROUND_SIZE_OPTIONS = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Auto", value: "auto" },
];

export const BACKGROUND_REPEAT_OPTIONS = [
  { label: "No Repeat", value: "no-repeat" },
  { label: "Repeat", value: "repeat" },
  { label: "Repeat X", value: "repeat-x" },
  { label: "Repeat Y", value: "repeat-y" },
];

export const BACKGROUND_POSITION_OPTIONS = [
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

export const BACKGROUND_ATTACHMENT_OPTIONS = [
  { label: "Scroll", value: "scroll" },
  { label: "Fixed", value: "fixed" },
  { label: "Local", value: "local" },
];

export function CanvasPropertyPanel() {
  const {
    editorTheme,
    previewMode,
    canvasHeight,
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    backgroundAttachment,
    setCanvasHeight,
    setBackgroundSize,
    setBackgroundRepeat,
    setBackgroundPosition,
    setBackgroundAttachment,
    setActivePanel,
  } = useEditorStore();

  return (
    <aside
      className={cn(
        "w-100 border-l flex flex-col shrink-0 z-[100] shadow-[0_0_15px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out editor-property-panel",
        editorTheme === "dark"
          ? "bg-[#111827] border-[#1f2937]"
          : "bg-white border-slate-100",
        previewMode ? "-mr-[400px] opacity-0" : "mr-0 opacity-100",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
          <div className="space-y-8">
            {/* Canvas Section */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Trang (Canvas)
              </label>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-slate-700">
                  Chiều cao (Height)
                </label>
                <Space.Compact className="w-full">
                  <InputNumber
                    min={400}
                    max={20000}
                    step={100}
                    value={canvasHeight}
                    onChange={(val) => setCanvasHeight(val || 1000)}
                    className="w-full h-10 flex items-center"
                  />
                  <div className="flex h-10 items-center rounded-r-[var(--ant-border-radius)] border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-500">
                    px
                  </div>
                </Space.Compact>
              </div>
            </div>

            <Divider className="my-0" />

            {/* Background Section */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Nền (Background)
              </label>
              <div
                className="rounded-2xl overflow-hidden w-1/2 aspect-square relative border-2 border-dashed border-slate-200 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                style={{
                  backgroundColor: backgroundColor || "#f1f5f9",
                  backgroundImage: backgroundImage
                    ? `url(${backgroundImage})`
                    : "none",
                  backgroundSize: backgroundSize,
                  backgroundRepeat: backgroundRepeat,
                  backgroundPosition: backgroundPosition,
                  backgroundAttachment: backgroundAttachment,
                }}
                onClick={() => setActivePanel("background")}
              />

            {backgroundImage && (
              <>
                <Divider className="my-4" />
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Kích thước (Size)
                    </label>
                    <Select
                      value={backgroundSize}
                      onChange={setBackgroundSize}
                      options={BACKGROUND_SIZE_OPTIONS}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Lặp lại (Repeat)
                    </label>
                    <Select
                      value={backgroundRepeat}
                      onChange={setBackgroundRepeat}
                      options={BACKGROUND_REPEAT_OPTIONS}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Vị trí (Position)
                    </label>
                    <Select
                      value={backgroundPosition}
                      onChange={setBackgroundPosition}
                      options={BACKGROUND_POSITION_OPTIONS}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Cuộn nền (Attachment)
                    </label>
                    <Select
                      value={backgroundAttachment}
                      onChange={setBackgroundAttachment}
                      options={BACKGROUND_ATTACHMENT_OPTIONS}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </aside>
  );
}
