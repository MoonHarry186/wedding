"use client";

import React from "react";
import { Modal, Switch, Button, Tooltip, App } from "antd";
import {
  RiHistoryLine,
  RiRestartLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiInboxArchiveLine,
  RiEyeLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TextElement } from "../elements/TextElement";
import { ImageElement } from "../elements/ImageElement";
import { GroupElement } from "../elements/GroupElement";
import type { BackupEntry, CanvasData, CanvasElement } from "@/types/editor";

interface BackupModalProps {
  open: boolean;
  onClose: () => void;
  templateId: string;
}

type LegacyBackupEntry = {
  id?: unknown;
  templateId?: unknown;
  timestamp?: unknown;
  canvasData?: unknown;
  elements?: unknown;
  canvasHeight?: unknown;
  backgroundColor?: unknown;
  backgroundImage?: unknown;
};

function normalizeBackup(raw: unknown): BackupEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as LegacyBackupEntry;
  if (
    typeof entry.id !== "string" ||
    typeof entry.templateId !== "string" ||
    typeof entry.timestamp !== "number"
  ) {
    return null;
  }

  if (
    entry.canvasData &&
    typeof entry.canvasData === "object" &&
    Array.isArray((entry.canvasData as CanvasData).elements)
  ) {
    return {
      id: entry.id,
      templateId: entry.templateId,
      timestamp: entry.timestamp,
      canvasData: entry.canvasData as CanvasData,
    };
  }

  if (Array.isArray(entry.elements)) {
    return {
      id: entry.id,
      templateId: entry.templateId,
      timestamp: entry.timestamp,
      canvasData: {
        elements: entry.elements as CanvasElement[],
        canvasHeight:
          typeof entry.canvasHeight === "number" ? entry.canvasHeight : 1000,
        backgroundColor:
          typeof entry.backgroundColor === "string"
            ? entry.backgroundColor
            : undefined,
        backgroundImage:
          typeof entry.backgroundImage === "string"
            ? entry.backgroundImage
            : undefined,
      },
    };
  }

  return null;
}

export function BackupModal({ open, onClose, templateId }: BackupModalProps) {
  const { message, modal } = App.useApp();
  const {
    autoSaveEnabled,
    toggleAutoSave,
    autoSaveNotificationEnabled,
    toggleAutoSaveNotification,
    backups,
    loadBackup,
    deleteBackup,
    setBackups,
  } = useEditorStore();

  const [previewBackup, setPreviewBackup] = React.useState<BackupEntry | null>(null);

  const handleLoadBackup = (id: string) => {
    modal.confirm({
      title: "Khôi phục bản sao lưu",
      content:
        "Dữ liệu hiện tại trên canvas sẽ bị thay thế bởi bản sao lưu này. Bạn có chắc chắn muốn khôi phục không?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: () => {
        loadBackup(id);
        message.success("Đã khôi phục bản sao lưu");
        onClose();
      },
    });
  };

  const handleRefresh = () => {
    const key = "cinlove_backups";
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const allBackups = JSON.parse(saved);
        if (Array.isArray(allBackups)) {
          const templateBackups = allBackups
            .map(normalizeBackup)
            .filter((backup): backup is BackupEntry => backup?.templateId === templateId)
            .slice(0, 5);
          setBackups(templateBackups);
          message.success("Đã cập nhật danh sách bản sao lưu");
        }
      } catch (e) {
        console.error("Failed to parse backups", e);
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(timestamp));
  };



  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="backup-management-modal"
      closeIcon={<RiCloseLine size={20} className="text-slate-400" />}
    >
      <div className="pt-2">
        <h2 className="text-xl font-bold text-[#070235] mb-6">
          Quản lý bản sao lưu
        </h2>
        {/* Auto Save Toggle */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between mb-8 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Tự động lưu & sao lưu
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  autoSaveEnabled
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {autoSaveEnabled ? "Bật" : "Tắt"}
              </span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Hệ thống sẽ tự lưu mỗi 30 giây khi bật.
            </p>
          </div>
          <Switch
            checked={autoSaveEnabled}
            onChange={toggleAutoSave}
            className={cn(autoSaveEnabled ? "bg-primary" : "bg-slate-300")}
          />
        </div>

        {/* Auto Save Notification Toggle */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between mb-8 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Thông báo khi lưu
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  autoSaveNotificationEnabled
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {autoSaveNotificationEnabled ? "Bật" : "Tắt"}
              </span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Hiển thị thông báo nhỏ mỗi khi hệ thống tự động lưu.
            </p>
          </div>
          <Switch
            checked={autoSaveNotificationEnabled}
            onChange={toggleAutoSaveNotification}
            className={cn(
              autoSaveNotificationEnabled ? "bg-primary" : "bg-slate-300",
            )}
          />
        </div>

        {/* Recent Backups Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <RiHistoryLine size={20} />
            <span>Bản sao lưu gần đây</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#070235] transition-colors"
          >
            <RiRestartLine size={18} />
            Làm mới
          </button>
        </div>

        {/* Backups List */}
        <div className="min-h-[280px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6">
          {backups.length > 0 ? (
            <div className="w-full space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                      <RiTimeLine size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700 text-lg">
                          {format(backup.timestamp, "HH:mm:ss", { locale: vi })}
                        </span>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {format(backup.timestamp, "dd MMMM, yyyy", { locale: vi })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip title="Xem trước">
                      <Button
                        type="text"
                        icon={
                          <RiEyeLine size={18} className="text-slate-600" />
                        }
                        onClick={() => setPreviewBackup(backup)}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa bản lưu này">
                      <Button
                        type="text"
                        danger
                        icon={<RiDeleteBinLine size={18} />}
                        onClick={() => deleteBackup(backup.id)}
                      />
                    </Tooltip>
                    <Button
                      type="primary"
                      className="bg-[#070235] hover:bg-[#1e1b4b] border-none"
                      onClick={() => handleLoadBackup(backup.id)}
                    >
                      Khôi phục
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <RiInboxArchiveLine size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-medium">Chưa có bản sao lưu</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 italic mb-6">
            Chỉ giữ tối đa 5 bản sao lưu gần nhất. Các bản lưu cũ hơn 7 ngày sẽ
            tự bị xóa.
          </p>
          <Button
            onClick={onClose}
            className="h-11 px-10 rounded-full font-bold bg-primary hover:opacity-90 text-white border-none shadow-lg shadow-primary/20"
          >
            Đóng
          </Button>
        </div>
      </div>

      {/* Preview Modal for specific backup */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RiEyeLine size={20} className="text-primary" />
            <span>
              Xem trước bản lưu:{" "}
              {previewBackup ? format(previewBackup.timestamp, "HH:mm:ss - dd/MM/yyyy", { locale: vi }) : ""}
            </span>
          </div>
        }
        open={!!previewBackup}
        onCancel={() => setPreviewBackup(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewBackup(null)}>
            Đóng
          </Button>,
          <Button
            key="restore"
            type="primary"
            className="bg-[#070235] hover:bg-[#1e1b4b] border-none"
            onClick={() => {
              if (!previewBackup) return;
              handleLoadBackup(previewBackup.id);
              setPreviewBackup(null);
            }}
          >
            Khôi phục bản này
          </Button>,
        ]}
        width={600}
        centered
        destroyOnHidden
      >
        <div className="bg-slate-200 flex justify-center items-start overflow-auto max-h-[70vh] border-y border-slate-100 p-8">
          {previewBackup && (
            <div
              className="shadow-2xl relative shrink-0 pointer-events-none"
              style={{
                width: "500px",
                height: `${previewBackup.canvasData.canvasHeight || 1000}px`,
                transform: `scale(0.8)`,
                transformOrigin: "top center",
                backgroundColor: previewBackup.canvasData.backgroundImage ? "transparent" : (previewBackup.canvasData.backgroundColor?.startsWith("linear-gradient") ? "transparent" : (previewBackup.canvasData.backgroundColor || "#ffffff")),
                backgroundImage: previewBackup.canvasData.backgroundImage ? `url(${previewBackup.canvasData.backgroundImage})` : (previewBackup.canvasData.backgroundColor?.startsWith("linear-gradient") ? previewBackup.canvasData.backgroundColor : "none"),
                backgroundSize: previewBackup.canvasData.backgroundImage ? "cover" : "auto",
                backgroundPosition: "center",
              }}
            >
              {[...previewBackup.canvasData.elements]
                .filter((el) => !el.groupId)
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((element) => {
                  if (element.type === "group") {
                    return (
                      <GroupElement
                        key={element.id}
                        element={element}
                        isSelected={false}
                        onSelect={() => {}}
                        onUpdate={() => {}}
                        isReadOnly={true}
                        overrideElements={previewBackup.canvasData.elements}
                      />
                    );
                  }
                  if (element.type === "text") {
                    return (
                      <TextElement
                        key={element.id}
                        element={element}
                        isSelected={false}
                        onSelect={() => {}}
                        onUpdate={() => {}}
                        isReadOnly={true}
                      />
                    );
                  }
                  if (element.type === "image") {
                    return (
                      <ImageElement
                        key={element.id}
                        element={element}
                        isSelected={false}
                        onSelect={() => {}}
                        onUpdate={() => {}}
                        isReadOnly={true}
                      />
                    );
                  }
                  return null;
                })}
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-slate-400 italic">
          * Hình ảnh và font chữ có thể hiển thị khác một chút so với thực tế
        </div>
      </Modal>
    </Modal>
  );
}
