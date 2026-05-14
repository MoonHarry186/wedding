"use client";

import React from "react";
import { Button } from "antd";
import { RiInformationLine, RiMusic2Line } from "@remixicon/react";
import {
  GroupOutlined,
  NodeCollapseOutlined,
} from "@ant-design/icons";
import { useEditorStore } from "@/store/editor.store";
import { TextPanel } from "./panels/TextPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { CalendarPanel } from "./panels/CalendarPanel";
import { CountdownPanel } from "./panels/CountdownPanel";
import { MapPanel } from "./panels/MapPanel";
import { VideoPanel } from "./panels/VideoPanel";
import { GiftPanel } from "./panels/GiftPanel";
import { TemplateSettingsPanel } from "./panels/TemplateSettingsPanel";
import { cn } from "@/lib/utils";
import { Slider, ColorPicker } from "antd";
import type { CanvasElement } from "@/types/editor";

const MUSIC_ICONS = [
  { id: "note", emoji: "🎵" },
  { id: "disc", emoji: "💿" },
  { id: "heart", emoji: "💝" },
  { id: "star", emoji: "✨" },
  { id: "rose", emoji: "🌹" },
];

type ActiveSelection = {
  type: "activeSelection";
  id: string;
};

export function EditorPropertyPanel() {
  const {
    selectedElementIds,
    elements,
    groupElements,
    ungroupElements,
    previewMode,
    activePanel,
    bgMusicUrl,
    musicVolume,
    musicIcon,
    musicIconColor,
    setMusicVolume,
    setMusicIcon,
    setMusicIconColor,
    updateElement,
    editorTheme,
  } = useEditorStore();

  const isMultiSelection = selectedElementIds.length > 1;
  const selectedElement: CanvasElement | ActiveSelection | undefined =
    isMultiSelection
      ? { type: "activeSelection", id: "active-selection" }
      : elements.find((el) => el.id === selectedElementIds[0]);

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
      {selectedElement ? (
        /* Section: Element Properties */
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {selectedElement.type === "text" && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <TextPanel element={selectedElement as any} />
            )}
            {selectedElement.type === "image" && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ImagePanel element={selectedElement as any} />
            )}

            {selectedElement.type === "widget" &&
              selectedElement.widgetType === "calendar" && (
                <CalendarPanel
                  element={selectedElement}
                  onUpdate={(updates) =>
                    updateElement(selectedElement.id, updates)
                  }
                />
              )}

            {selectedElement.type === "widget" &&
              selectedElement.widgetType === "countdown" && (
                <CountdownPanel
                  element={selectedElement}
                  onUpdate={(updates) =>
                    updateElement(selectedElement.id, updates)
                  }
                />
              )}

            {selectedElement.type === "widget" &&
              selectedElement.widgetType === "map" && (
                <MapPanel
                  element={selectedElement}
                  onUpdate={(updates) =>
                    updateElement(selectedElement.id, updates)
                  }
                />
              )}

            {selectedElement.type === "widget" &&
              selectedElement.widgetType === "video" && (
                <VideoPanel
                  element={selectedElement}
                  onUpdate={(updates) =>
                    updateElement(selectedElement.id, updates)
                  }
                />
              )}

            {selectedElement.type === "widget" &&
              selectedElement.widgetType === "qr_gift" && (
                <GiftPanel
                  element={selectedElement}
                  onUpdate={(updates) =>
                    updateElement(selectedElement.id, updates)
                  }
                />
              )}

            {selectedElement.type === "group" && (
              <div className="space-y-6 pt-2">
                <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <RiInformationLine
                      size={18}
                      className="text-amber-500 shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                      Đây là một nhóm phần tử. Bạn có thể rã nhóm để chỉnh sửa
                      các thành phần bên trong một cách độc lập.
                    </p>
                  </div>
                </div>

                <Button
                  icon={<NodeCollapseOutlined />}
                  onClick={() => ungroupElements()}
                  className="w-full h-12 border-amber-200 text-amber-700 hover:!border-amber-400 hover:!text-amber-800 font-bold text-sm rounded-xl transition-all shadow-sm"
                >
                  Rã nhóm (Ctrl + Shift + G)
                </Button>
              </div>
            )}

            {selectedElement.type === "activeSelection" && (
              <div className="space-y-6 pt-2">
                <div className="p-4 bg-[#e3dfff]/50 border border-[#c4c1fb]/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <RiInformationLine
                      size={18}
                      className="text-[#070235] shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-[#1e1b4b]/80 font-medium leading-relaxed">
                      Đang chọn{" "}
                      <span className="font-bold text-[#1e1b4b]">
                        {selectedElementIds.length}
                      </span>{" "}
                      phần tử. Bạn có thể nhóm chúng lại để quản lý dễ dàng hơn.
                    </p>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<GroupOutlined />}
                  onClick={groupElements}
                  className="w-full h-12 bg-[#070235] hover:!bg-[#1e1b4b] border-none shadow-lg shadow-[#c4c1fb]/20 font-medium text-[15px] rounded-xl transition-all"
                >
                  Nhóm phần tử (Ctrl + G)
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : activePanel === "music" ? (
        /* Section: Music Settings */
        <div className="flex flex-col h-full animate-in fade-in duration-300">
          <div
            className={cn(
              "px-6 py-8 border-b editor-surface-panel",
              editorTheme === "dark"
                ? "border-[#1f2937] bg-[#111827]"
                : "border-slate-50 bg-white",
            )}
          >
            <h2 className="text-[11px] font-semibold text-[#070235] uppercase tracking-[0.08em] mb-2">
              Tuỳ chỉnh
            </h2>
            <div className="flex items-center gap-2">
              <RiMusic2Line size={20} className="text-slate-400" />
              <p className="text-[18px] leading-none font-bold text-slate-800">
                Nhạc nền thiệp
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-8">
            {/* Selected Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Đang chọn
              </p>
              <p className="text-sm font-bold text-slate-700 truncate">
                {bgMusicUrl ? "Đã chọn nhạc nền" : "Chưa chọn bài hát"}
              </p>
            </div>

            {/* Icon Selection */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Biểu tượng
              </label>
              <div className="flex items-center gap-3">
                {MUSIC_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setMusicIcon(icon.id)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border-2",
                      musicIcon === icon.id
                        ? "border-[#070235] bg-[#e3dfff] scale-110 shadow-sm"
                        : "border-slate-100 hover:border-slate-200",
                    )}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Color */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Màu sắc biểu tượng
              </label>
              <ColorPicker
                value={musicIconColor}
                onChange={(c) => setMusicIconColor(c.toHexString())}
                showText
                className="w-full h-11 premium-select"
              />
            </div>

            {/* Volume */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Âm lượng
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {musicVolume}
                </span>
              </div>
              <Slider
                value={musicVolume}
                onChange={setMusicVolume}
                className="premium-slider"
                tooltip={{ open: false }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Section: Global Settings */
        <TemplateSettingsPanel />
      )}
    </aside>
  );
}
