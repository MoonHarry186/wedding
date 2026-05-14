"use client";

import React from "react";
import { Button, Tooltip, Input, App, Badge, Select } from "antd";
import {
  RiUploadCloudLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiEyeLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiMoonClearLine,
  RiSunLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editor.store";
import { usePublishTemplate } from "@/hooks/useTemplates";
import { cn } from "@/lib/utils";
import { EDITOR_PREVIEW_DEVICES } from "@/constants/editorPreviewDevices";
import { BackupModal } from "./modals/BackupModal";

export function EditorToolbar({
  templateId,
  title,
}: {
  templateId: string;
  title: string;
}) {
  const { message } = App.useApp();
  const router = useRouter();
  const {
    isDirty,
    setDirty,
    undo,
    redo,
    history,
    future,
    autoSaveEnabled,
    previewMode,
    previewDeviceId,
    setPreviewMode,
    setPreviewDeviceId,
    editorTheme,
    toggleEditorTheme,
    getCanvasData,
  } = useEditorStore();
  const publishTemplate = usePublishTemplate();
  const [backupModalOpen, setBackupModalOpen] = React.useState(false);

  // Save draft to localStorage and create a backup entry

  // Publish — saves canvasData to backend as a new version
  const handlePublish = async () => {
    try {
      // Save to localStorage first so draft is in sync
      // Draft is now handled by the unified backup system in EditorPage

      await publishTemplate.mutateAsync({
        id: templateId,
        canvasData: getCanvasData(),
        changeNote: "Xuất bản từ editor",
      });
      setDirty(false);
      message.success("Đã xuất bản template thành công");
    } catch {
      message.error("Không thể xuất bản. Vui lòng thử lại.");
    }
  };

  return (
    <header
      className={cn(
        "h-14 flex items-center justify-between px-4 z-50 shrink-0 relative transition-all duration-300 border-b",
        editorTheme === "dark"
          ? "bg-[#020617] border-[#1f2937] text-slate-100"
          : "bg-white border-[#1e1b4b] text-white",
        previewMode && "opacity-60 hover:opacity-100",
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-6">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/dashboard/templates")}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl italic shadow-sm",
              editorTheme === "dark"
                ? "bg-white/8 text-slate-100"
                : "bg-white/10 text-white",
            )}
          >
            C
          </div>
          <span
            className={cn(
              "text-xl font-bold tracking-tight hidden sm:block",
              editorTheme === "dark" ? "text-slate-100" : "text-white",
            )}
          >
            CinLove
          </span>
        </div>

        {!previewMode && (
          <div
            className={cn(
              "flex items-center gap-4 border-l pl-6 animate-in fade-in slide-in-from-left-4 duration-300",
              editorTheme === "dark"
                ? "text-slate-500 border-white/8"
                : "text-slate-400 border-white/10",
            )}
          >
            <Tooltip title="Hoàn tác (Ctrl+Z)">
              <button
                onClick={undo}
                disabled={history.length === 0}
                className={cn(
                  "transition-colors",
                  history.length > 0
                    ? "text-white hover:text-slate-300 active:scale-95"
                    : "text-slate-500 opacity-50 cursor-not-allowed",
                )}
              >
                <RiArrowGoBackLine size={20} />
              </button>
            </Tooltip>
            <Tooltip title="Làm lại (Ctrl+Shift+Z)">
              <button
                onClick={redo}
                disabled={future.length === 0}
                className={cn(
                  "transition-colors",
                  future.length > 0
                    ? "text-white hover:text-slate-300 active:scale-95"
                    : "text-slate-500 opacity-50 cursor-not-allowed",
                )}
              >
                <RiArrowGoForwardLine size={20} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Center: Title & Backup Status */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            variant="borderless"
            className={cn(
              "text-center font-bold rounded transition-colors w-auto min-w-[200px]",
              editorTheme === "dark"
                ? "text-slate-100 hover:bg-white/8 focus:bg-white/8"
                : "text-white hover:bg-white/10 focus:bg-white/10",
            )}
            readOnly
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {previewMode && (
          <Select
            size="middle"
            value={previewDeviceId}
            onChange={setPreviewDeviceId}
            popupMatchSelectWidth={false}
            options={EDITOR_PREVIEW_DEVICES.map((device) => ({
              value: device.id,
              label: `${device.label} • ${device.width}×${device.height}`,
            }))}
            className="w-[240px]"
          />
        )}

        {!previewMode && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Backup Status Toggle */}
            <div
              onClick={() => setBackupModalOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all border",
                autoSaveEnabled
                  ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10",
              )}
            >
              {autoSaveEnabled ? (
                <RiCheckboxCircleLine size={16} />
              ) : (
                <RiInformationLine size={16} />
              )}
              <span className="text-[11px] font-bold uppercase tracking-tight">
                Sao lưu: {autoSaveEnabled ? "Bật" : "Tắt"}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-1" />

            <div className="flex items-center gap-2 text-sm text-slate-400 mr-1">
              <Badge status={isDirty ? "warning" : "success"} />
              <span className="hidden lg:inline font-medium text-[12px]">
                {isDirty ? "Chưa lưu" : "Đã lưu"}
              </span>
            </div>
          </div>
        )}

        <Button
          type="text"
          className={cn(
            "flex items-center gap-2 px-3 h-9 border-none transition-all duration-300",
            editorTheme === "dark"
              ? "text-slate-300 hover:text-white hover:bg-white/8"
              : "text-slate-300 hover:text-white hover:bg-white/10",
          )}
          icon={
            editorTheme === "dark" ? (
              <RiSunLine size={18} />
            ) : (
              <RiMoonClearLine size={18} />
            )
          }
          onClick={toggleEditorTheme}
        >
          {editorTheme === "dark" ? "Light" : "Dark"}
        </Button>

        <Button
          type={previewMode ? "primary" : "text"}
          className={cn(
            "flex items-center gap-2 px-3 h-9 font-medium transition-all duration-300",
            previewMode
              ? "bg-[#c4c1fb] hover:bg-[#e3dfff] border-none text-[#070235] shadow-lg shadow-[#c4c1fb]/20"
              : "text-slate-300 hover:text-white hover:bg-white/10 border-none",
          )}
          icon={<RiEyeLine size={18} />}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? "Thoát xem" : "Xem trước"}
        </Button>

        {!previewMode && (
          <Button
            type="primary"
            className="bg-white hover:bg-slate-100 text-[#070235] border-none rounded flex items-center gap-2 px-6 h-9 font-semibold transition-all shadow-md animate-in fade-in slide-in-from-right-4 duration-300"
            icon={<RiUploadCloudLine size={18} />}
            onClick={handlePublish}
            loading={publishTemplate.isPending}
          >
            Xuất bản
          </Button>
        )}
      </div>

      <BackupModal
        open={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        templateId={templateId}
      />
    </header>
  );
}

