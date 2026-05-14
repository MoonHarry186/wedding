"use client";

import React from "react";
import {
  RiText,
  RiImageLine,
  RiPaletteLine,
  RiArchiveLine,
  RiMusic2Line,
  RiApps2Line,
  RiFilePaperLine,
  RiMagicLine,
  RiPulseLine,
  RiHistoryLine,
  RiQuestionLine,
  RiArrowLeftSLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";

interface ToolItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

type SidebarToolId =
  | "text"
  | "image"
  | "background"
  | "stock"
  | "music"
  | "widgets"
  | "templates"
  | "effects"
  | "presets"
  | "history";

function ToolItem({ icon, label, active, onClick }: ToolItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 group w-full py-2 rounded-lg transition-colors relative",
        active
          ? "bg-[#f2f4f6] text-[#070235]"
          : "text-[#787680] hover:text-[#070235]",
      )}
    >
      <div
        className={cn(
          "rounded-xl transition-all duration-300",
          !active && "group-hover:bg-[#f7f9fb]",
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[12px] tracking-[0.05em] transition-colors",
          active
            ? "text-[#070235]"
            : "text-[#787680] group-hover:text-[#191c1e]",
        )}
      >
        {label}
      </span>
    </button>
  );
}

import { TextAddPanel } from "./panels/TextAddPanel";
import { ImageAddPanel } from "./panels/ImageAddPanel";
import { BackgroundPanel } from "./panels/BackgroundPanel";
import { HistoryPanel } from "./panels/HistoryPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { StockPanel } from "./panels/StockPanel";
import { WidgetsPanel } from "./panels/WidgetsPanel";
import { MusicPanel } from "./panels/MusicPanel";
import { EffectsPanel } from "./panels/EffectsPanel";

export function EditorSidebar() {
  const { activePanel, setActivePanel, previewMode, editorTheme } =
    useEditorStore();

  const tools: Array<{
    id: SidebarToolId;
    icon: React.ReactNode;
    label: string;
  }> = [
    { id: "text", icon: <RiText size={22} />, label: "Văn bản" },
    { id: "image", icon: <RiImageLine size={22} />, label: "Hình ảnh" },
    { id: "background", icon: <RiPaletteLine size={22} />, label: "Nền" },
    { id: "stock", icon: <RiArchiveLine size={22} />, label: "Stock" },
    { id: "music", icon: <RiMusic2Line size={22} />, label: "Nhạc nền" },
    { id: "widgets", icon: <RiApps2Line size={22} />, label: "Tiện ích" },
    { id: "templates", icon: <RiFilePaperLine size={22} />, label: "Mẫu" },
    { id: "effects", icon: <RiMagicLine size={22} />, label: "Hiệu ứng" },
    { id: "presets", icon: <RiPulseLine size={22} />, label: "Presets" },
    { id: "history", icon: <RiHistoryLine size={22} />, label: "Lịch sử" },
  ];

  const renderPanelContent = () => {
    switch (activePanel) {
      case "text":
        return <TextAddPanel />;
      case "image":
        return <ImageAddPanel />;
      case "background":
        return <BackgroundPanel />;
      case "stock":
        return <StockPanel />;
      case "music":
        return <MusicPanel />;
      case "widgets":
        return <WidgetsPanel />;
      case "effects":
        return <EffectsPanel />;
      case "history":
        return <HistoryPanel />;
      case "layers":
        return <LayersPanel />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full z-20 transition-all duration-500 ease-in-out shrink-0",
        previewMode ? "-ml-[368px] opacity-0" : "ml-0 opacity-100",
      )}
    >
      {/* Primary Sidebar Icons */}
      <aside
        className={cn(
          "w-20 border-r flex flex-col items-center py-4 gap-2 shrink-0 overflow-y-auto custom-scrollbar transition-colors editor-sidebar-primary",
          editorTheme === "dark"
            ? "bg-[#0f172a] border-[#1f2937]"
            : "bg-white border-[#eceef0]",
        )}
      >
        <div className="w-full flex flex-col gap-1">
          {tools.map((tool) => (
            <ToolItem
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              active={activePanel === tool.id}
              onClick={() =>
                setActivePanel(activePanel === tool.id ? null : tool.id)
              }
            />
          ))}
        </div>

        <div className="mt-auto mb-2">
          <button className="p-2 text-[#787680] hover:text-[#070235] transition-colors">
            <RiQuestionLine size={20} />
          </button>
        </div>
      </aside>

      {/* Secondary Sidebar Content */}
      {activePanel && (
        <aside
          className={cn(
            "w-96 border-r flex flex-col overflow-visible relative animate-in slide-in-from-left duration-200 shadow-2xl shadow-black/5 transition-colors editor-sidebar-secondary",
            editorTheme === "dark"
              ? "bg-[#111827] border-[#1f2937]"
              : "bg-white border-[#eceef0]",
          )}
        >
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {renderPanelContent()}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setActivePanel(null)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-6 h-20 border-y border-r rounded-r-[16px] flex items-center justify-center transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.03)] z-20 editor-surface-panel",
              editorTheme === "dark"
                ? "bg-[#111827] border-[#1f2937] text-slate-500 hover:text-slate-200"
                : "bg-white border-[#eceef0] text-slate-400 hover:text-slate-600",
            )}
            style={{ right: "-23px" }}
          >
            <RiArrowLeftSLine size={18} className="-ml-1" />
          </button>
        </aside>
      )}
    </div>
  );
}
