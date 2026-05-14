"use client";

import React, { useEffect, use } from "react";
import { Spin } from "antd";
import { useInvitation } from "@/hooks/useInvitations";
import { useEditorStore } from "@/store/editor.store";
import type { CanvasData } from "@/types/editor";
import { InvitationEditorToolbar } from "@/components/editor/InvitationEditorToolbar";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorPropertyPanel } from "@/components/editor/EditorPropertyPanel";
import { CanvasPropertyPanel } from "@/components/editor/CanvasPropertyPanel";
import { cn } from "@/lib/utils";

interface InvitationEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function InvitationEditorPage({
  params,
}: InvitationEditorPageProps) {
  const { id } = use(params);
  const { data: invitation, isLoading, error } = useInvitation(id);
  const {
    setCanvasData,
    selectedElementIds,
    editorTheme,
  } = useEditorStore();

  useEffect(() => {
    if (!invitation?.canvasData) return;
    setCanvasData(invitation.canvasData as CanvasData);
  }, [invitation, setCanvasData]);

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
        <p className="animate-pulse font-medium">Đang tải editor thiệp...</p>
      </div>
    );
  }

  if (error || !invitation) {
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
        <p>Không thể tìm thấy invitation hoặc bạn không có quyền truy cập.</p>
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
      <InvitationEditorToolbar
        invitationId={id}
        title={invitation.templateTitle || "Thiệp tuỳ chỉnh"}
      />
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <EditorCanvas />
        {selectedElementIds.length === 1 && selectedElementIds[0] === "canvas" ? (
          <CanvasPropertyPanel />
        ) : (
          <EditorPropertyPanel />
        )}
      </div>
    </div>
  );
}
