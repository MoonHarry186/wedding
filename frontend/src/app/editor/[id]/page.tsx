"use client";

import React, { useEffect, use } from "react";
import { Spin, App, Modal, Button, Tag, Typography } from "antd";
import { RiRestartLine, RiTimeLine } from "@remixicon/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
const { Text, Title } = Typography;
import { useTemplate } from "@/hooks/useTemplates";
import { useEditorStore } from "@/store/editor.store";
import type { BackupEntry, CanvasData, CanvasElement } from "@/types/editor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorPropertyPanel } from "@/components/editor/EditorPropertyPanel";
import { CanvasPropertyPanel } from "@/components/editor/CanvasPropertyPanel";
import { TextElement } from "@/components/editor/elements/TextElement";
import { ImageElement } from "@/components/editor/elements/ImageElement";
import { GroupElement } from "@/components/editor/elements/GroupElement";
import { cn } from "@/lib/utils";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

// Unified storage key for all backups and drafts
function backupKey() {
  return "cinlove_backups";
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

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params);
  const { message } = App.useApp();
  const { data: template, isLoading, error } = useTemplate(id);
  const {
    setElements,
    elements,
    canvasHeight,
    setCanvasHeight,
    isDirty,
    setDirty,
    autoSaveEnabled,
    autoSaveNotificationEnabled,
    addBackup,
    setBackups,
    backups,
    editorTheme,
    selectedElementIds,
    activePanel,
    setCanvasData,
    getCanvasData,
  } = useEditorStore();

  const [conflictDraft, setConflictDraft] = React.useState<BackupEntry | null>(null);


  // Load: backup (draft) first, fallback to published canvasData
  useEffect(() => {
    if (!template) return;

    const serverTime = new Date((template as { updatedAt?: string }).updatedAt || 0).getTime();
    const savedBackups = localStorage.getItem(backupKey());
    let localDraft: BackupEntry | null = null;

    if (savedBackups) {
      try {
        const parsed = JSON.parse(savedBackups);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          
          // 1. GLOBAL CLEANUP: Filter out backups older than 7 days across ALL templates
          const normalizedBackups = parsed
            .map(normalizeBackup)
            .filter((backup): backup is BackupEntry => backup !== null);
          const freshBackups = normalizedBackups.filter((b) => (now - b.timestamp) < sevenDaysMs);
          
          // 2. TEMPLATE SPECIFIC: Get backups for this template
          const templateBackups = freshBackups.filter((b) => b.templateId === id);
          
          // Limit to 5 for the current template
          const limitedTemplateBackups = templateBackups
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          
          setBackups(limitedTemplateBackups);
          
          // 3. PERSIST CLEANUP: If we removed something (global or limited), sync back to localStorage
          if (freshBackups.length !== normalizedBackups.length || limitedTemplateBackups.length !== templateBackups.length) {
            const others = freshBackups.filter(b => b.templateId !== id);
            localStorage.setItem(backupKey(), JSON.stringify([...limitedTemplateBackups, ...others]));
          }
          
          // Use the newest backup for this template as the draft
          if (limitedTemplateBackups.length > 0) {
            localDraft = limitedTemplateBackups[0];
          }
        }
      } catch (e) {
        console.error("Failed to load backups", e);
      }
    }

    const loadServerData = () => {
      const published = (template as { canvasData?: CanvasData }).canvasData;
      if (published) {
        setCanvasData(published);
      } else {
        setCanvasData({ elements: [] });
      }
    };

    // 1. Always load server data first
    loadServerData();

    // 2. Check for newer local draft
    if (localDraft) {
      const localTime = localDraft.timestamp;

      if (localTime > serverTime + 1000) {
        // Local is strictly newer -> Trigger conflict modal
        setTimeout(() => setConflictDraft(localDraft), 0);
      }
    }
  }, [template, id, setCanvasData, setBackups]);

  // Sync backups to localStorage whenever they change
  useEffect(() => {
    if (backups.length > 0) {
      const savedBackups = localStorage.getItem(backupKey());
      let allOtherBackups = [];
      if (savedBackups) {
        try {
          const parsed = JSON.parse(savedBackups);
          if (Array.isArray(parsed)) {
            allOtherBackups = parsed.filter((b) => b.templateId !== id);
          }
        } catch {}
      }

      const merged = [...backups, ...allOtherBackups];
      localStorage.setItem(backupKey(), JSON.stringify(merged));
    }
  }, [backups, id]);

  // Auto-save backup to localStorage every 30s when dirty and enabled
  useEffect(() => {
    if (!isDirty || !autoSaveEnabled) return;

    const timer = setInterval(() => {
      // Add to backups list (the latest will automatically be considered the draft)
      addBackup(id);

      setDirty(false);

      if (autoSaveNotificationEnabled) {
        message.success({
          content: "Đã tự động lưu bản sao",
          key: "auto-save-notif",
          duration: 2,
        });
      }
    }, 30_000);

    return () => clearInterval(timer);
  }, [
    id,
    isDirty,
    setDirty,
    autoSaveEnabled,
    addBackup,
    autoSaveNotificationEnabled,
    message,
  ]);

  useEffect(() => {
    document.body.dataset.editorTheme = editorTheme;
    return () => {
      delete document.body.dataset.editorTheme;
    };
  }, [editorTheme]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "h-screen w-screen flex flex-col items-center justify-center gap-4 transition-colors",
          editorTheme === "dark"
            ? "bg-[#111827] text-slate-200"
            : "bg-[#e0e3e5] text-slate-700",
        )}
      >
        <Spin size="large" />
        <p className="animate-pulse font-medium">
          Đang tải trình chỉnh sửa...
        </p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div
        className={cn(
          "h-screen w-screen flex flex-col items-center justify-center gap-4 transition-colors",
          editorTheme === "dark"
            ? "bg-[#111827] text-slate-200"
            : "bg-[#e0e3e5] text-slate-700",
        )}
      >
        <h1 className="text-2xl text-red-600 font-bold">Đã xảy ra lỗi</h1>
        <p>
          Không thể tìm thấy template hoặc bạn không có quyền truy cập.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "editor-shell h-screen w-screen flex flex-col overflow-hidden transition-colors",
        editorTheme === "dark" ? "editor-theme-dark" : "editor-theme-light",
      )}
      data-editor-theme={editorTheme}
    >
      <EditorToolbar templateId={id} title={template.title} />
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <EditorCanvas />
        {selectedElementIds.length === 1 && selectedElementIds[0] === "canvas" ? (
          <CanvasPropertyPanel />
        ) : (
          <EditorPropertyPanel />
        )}
      </div>

      {/* Conflict Restore Modal */}
      <Modal
        open={!!conflictDraft}
        onCancel={() => setConflictDraft(null)}
        footer={null}
        width={600}
        centered
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        className="restore-modal"
      >
        <div className="py-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
              <RiRestartLine size={28} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>Phát hiện bản nháp mới hơn</Title>
              <Text type="secondary">Bạn có một bản nháp chưa lưu trên thiết bị này với nội dung mới hơn máy chủ.</Text>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <RiTimeLine className="text-slate-400" size={18} />
                <span className="font-medium text-slate-700">
                  {conflictDraft && format(conflictDraft.timestamp, "HH:mm:ss - dd/MM/yyyy", { locale: vi })}
                </span>
                <Tag color="orange" className="ml-2">Mới hơn</Tag>
              </div>
              <Text type="secondary">{conflictDraft?.canvasData?.elements?.length || 0} phần tử</Text>
            </div>
            
            {/* Scaled Preview Area - Now Scrollable */}
            <div className="p-4 bg-slate-200 flex justify-center overflow-y-auto max-h-[400px] items-start border-y border-slate-300">
              <div 
                className="bg-white shadow-xl relative overflow-hidden"
                style={{ 
                  width: '350px', // Fixed preview width
                height: `${(conflictDraft?.canvasData?.canvasHeight || 1000) * (350 / 500)}px`, // Proportional height
                  borderRadius: '4px',
                  minHeight: '200px'
                }}
              >
                <div 
                  className="pointer-events-none" 
                  style={{ 
                    transform: `scale(${350 / 500})`, 
                    transformOrigin: 'top left',
                    width: '500px',
                    height: (conflictDraft?.canvasData?.canvasHeight || 1000) + 'px',
                    position: 'relative'
                  }}
                >
                  {conflictDraft?.canvasData?.elements
                    ?.filter((el: CanvasElement) => !el.groupId) // Only root elements, groups handle their children
                    .sort((a: CanvasElement, b: CanvasElement) => (a.zIndex || 0) - (b.zIndex || 0))
                    .map((element: CanvasElement) => {
                    if (element.type === "group") {
                        return (
                          <GroupElement
                            key={element.id}
                            element={element}
                            isSelected={false}
                            onSelect={() => {}}
                            onUpdate={() => {}}
                            isReadOnly={true}
                            overrideElements={conflictDraft?.canvasData?.elements}
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
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              size="large" 
              className="px-8 border-slate-200"
              onClick={() => setConflictDraft(null)}
            >
              Bỏ qua, dùng bản Server
            </Button>
            <Button 
              type="primary" 
              size="large" 
              className="px-8 bg-amber-500 hover:bg-amber-600 border-none"
              icon={<RiRestartLine size={18} />}
              onClick={() => {
                setCanvasData(conflictDraft!.canvasData);
                setConflictDraft(null);
                message.success("Đã khôi phục bản nháp thành công");
              }}
            >
              Khôi phục bản nháp này
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
