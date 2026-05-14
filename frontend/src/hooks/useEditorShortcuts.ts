import { useEffect, useRef } from "react";
import { App } from "antd";
import { useEditorStore } from "@/store/editor.store";
import type { CanvasElement, CanvasData, TextElement as TextElementType } from "@/types/editor";

interface PublishTemplateFn {
  isPending: boolean;
  mutateAsync: (args: {
    id: string;
    canvasData: CanvasData;
    changeNote?: string;
  }) => Promise<unknown>;
}

interface UseEditorShortcutsProps {
  templateId: string;
  publishTemplate: PublishTemplateFn;
  mainRef: React.RefObject<HTMLDivElement | null>;
  setIsSpacePressed: (val: boolean) => void;
  setIsPanning: (val: boolean) => void;
  setIsShortcutsModalOpen: (val: boolean) => void;
  setIsContentModalOpen: (val: boolean) => void;
  setBodyCursor: (cursor: string) => void;
}

export function useEditorShortcuts({
  templateId,
  publishTemplate,
  mainRef,
  setIsSpacePressed,
  setIsPanning,
  setIsShortcutsModalOpen,
  setIsContentModalOpen,
  setBodyCursor,
}: UseEditorShortcutsProps) {
  const { message } = App.useApp();
  const {
    elements,
    selectedElementIds,
    setSelectedElementIds,
    setActiveTool,
    setActivePanel,
    zoom,
    setZoom,
    canvasHeight,
    gridVisible,
    setGridVisible,
    duplicateElements,
    deleteElements,
    updateElement,
    groupElements,
    ungroupElements,
    undo,
    redo,
    setDirty,
    previewMode,
    setPreviewMode,
    setIsCropModalOpen,
    moveElements,
    getCanvasData,
  } = useEditorStore();

  const latestRef = useRef({
    elements,
    selectedElementIds,
    zoom,
    gridVisible,
    previewMode,
    canvasHeight,
    templateId,
    publishTemplate,
    undo,
    redo,
    deleteElements,
    duplicateElements,
    updateElement,
    setZoom,
    setSelectedElementIds,
    setActiveTool,
    setActivePanel,
    groupElements,
    ungroupElements,
    setGridVisible,
    setDirty,
    setIsShortcutsModalOpen,
    setIsContentModalOpen,
    setPreviewMode,
    setIsCropModalOpen,
    moveElements,
    getCanvasData,
  });

  useEffect(() => {
    latestRef.current = {
      elements,
      selectedElementIds,
      zoom,
      gridVisible,
      previewMode,
      canvasHeight,
      templateId,
      publishTemplate,
      undo,
      redo,
      deleteElements,
      duplicateElements,
      updateElement,
      setZoom,
      setSelectedElementIds,
      setActiveTool,
      setActivePanel,
      groupElements,
      ungroupElements,
      setGridVisible,
      setDirty,
      setIsShortcutsModalOpen,
      setIsContentModalOpen,
      setPreviewMode,
      setIsCropModalOpen,
      moveElements,
      getCanvasData,
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = latestRef.current;
      const isMod = e.metaKey || e.ctrlKey;
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

      if (e.code === "Space" && !isInput) {
        setIsSpacePressed(true);
        if (!e.repeat) {
          setBodyCursor("grab");
        }
        if (!isInput) e.preventDefault();
      }

      if (isInput) return;

      if (e.key === "Escape") {
        if (state.previewMode) {
          state.setPreviewMode(false);
        } else {
          state.setSelectedElementIds([]);
          state.setActiveTool("select");
        }
        e.preventDefault();
      }

      if (e.key.toLowerCase() === "t" && !isMod && !e.altKey) {
        state.setActiveTool("text");
        e.preventDefault();
      }

      if (e.key.toLowerCase() === "b" && !isMod && !e.altKey) {
        state.setActivePanel("background");
        e.preventDefault();
      }

      if (e.key.toLowerCase() === "c" && !state.previewMode && !isMod && !e.altKey) {
        const isSingleImage =
          state.selectedElementIds.length === 1 &&
          state.elements.find((el) => el.id === state.selectedElementIds[0])?.type ===
            "image";

        if (isSingleImage) {
          state.setIsCropModalOpen(true);
          e.preventDefault();
        }
      }

      if (isMod && !e.shiftKey && e.code === "KeyG") {
        state.groupElements();
        e.preventDefault();
        return;
      }

      if (isMod && e.shiftKey && e.code === "KeyG") {
        state.ungroupElements();
        e.preventDefault();
        return;
      }

      if (isMod && e.key === "z") {
        if (e.shiftKey) {
          state.redo();
        } else {
          state.undo();
        }
        e.preventDefault();
      } else if (
        isMod &&
        (e.key === "y" || (isMod && e.shiftKey && e.key === "Z"))
      ) {
        state.redo();
        e.preventDefault();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedElementIds.length > 0) {
          state.deleteElements(state.selectedElementIds);
          e.preventDefault();
        }
      }

      if (isMod && e.key === "d") {
        if (state.selectedElementIds.length > 0) {
          state.duplicateElements(state.selectedElementIds);
          e.preventDefault();
        }
      }

      if (
        isMod &&
        (e.code === "KeyB" || e.code === "KeyI" || e.code === "KeyU")
      ) {
        const textElements = state.elements.filter(
          (el) => state.selectedElementIds.includes(el.id) && el.type === "text",
        );

        if (textElements.length > 0) {
          (textElements as TextElementType[]).forEach((el) => {
            const updates: Partial<TextElementType> = {};
            if (e.code === "KeyB") {
              updates.fontWeight =
                el.fontWeight === "bold" || el.fontWeight === 700
                  ? 400
                  : "bold";
            } else if (e.code === "KeyI") {
              updates.fontStyle =
                el.fontStyle === "italic" ? "normal" : "italic";
            } else if (e.code === "KeyU") {
              updates.textDecoration =
                el.textDecoration === "underline" ? "none" : "underline";
            }
            state.updateElement(el.id, updates);
          });
          e.preventDefault();
        }
      }

      if (isMod && e.code === "KeyA") {
        const topLevelIds = state.elements
          .filter((el) => !el.groupId)
          .map((el) => el.id);
        state.setSelectedElementIds(topLevelIds);
        e.preventDefault();
      }

      if (isMod && e.code === "KeyS") {
        e.preventDefault();

        if (state.publishTemplate.isPending) return;

        const handlePublishShortcut = async () => {
          try {
            await state.publishTemplate.mutateAsync({
              id: state.templateId,
              canvasData: state.getCanvasData(),
              changeNote: "Xuất bản qua phím tắt Ctrl+S",
            });

            state.setDirty(false);
            message.success({
              content: "Đã xuất bản template thành công (Ctrl+S)",
              key: "publish-message",
            });
          } catch (error) {
            message.error({
              content: "Không thể xuất bản. Vui lòng thử lại.",
              key: "publish-message",
            });
          }
        };

        handlePublishShortcut();
      }

      if (isMod && e.key === "=") {
        state.setZoom(Math.min(2, state.zoom + 0.1));
        e.preventDefault();
      }
      if (isMod && e.key === "-") {
        state.setZoom(Math.max(0.5, state.zoom - 0.1));
        e.preventDefault();
      }
      if (isMod && e.key === "0") {
        state.setZoom(1);
        e.preventDefault();
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        state.setIsShortcutsModalOpen(true);
      }

      if (e.code === "KeyG" && !isMod && !e.altKey && !e.shiftKey) {
        state.setGridVisible(!state.gridVisible);
        e.preventDefault();
      }

      if (e.code === "KeyL" && !isMod && !e.altKey && !e.shiftKey) {
        state.setActivePanel("layers");
        e.preventDefault();
      }

      if (e.code === "KeyH" && !isMod && !e.altKey && !e.shiftKey) {
        state.setActivePanel("history");
        e.preventDefault();
      }

      if (
        (isMod && e.code === "KeyE") ||
        (e.altKey && e.code === "KeyE") ||
        (e.code === "KeyE" && !isMod && !e.altKey && !e.shiftKey)
      ) {
        state.setIsContentModalOpen(true);
        e.preventDefault();
      }

      if (e.key === "Home") {
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        e.preventDefault();
      }

      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) &&
        state.selectedElementIds.length > 0
      ) {
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;

        state.moveElements(state.selectedElementIds, dx, dy);
        e.preventDefault();
      }

      if (state.selectedElementIds.length > 0) {
        const el = state.elements.find((el) => el.id === state.selectedElementIds[0]);
        if (el) {
          if (e.key === "[") {
            state.selectedElementIds.forEach((id) =>
              state.updateElement(id, {
                rotation: (el.rotation || 0) - 15,
              }),
            );
            e.preventDefault();
          }
          if (e.key === "]") {
            state.selectedElementIds.forEach((id) =>
              state.updateElement(id, {
                rotation: (el.rotation || 0) + 15,
              }),
            );
            e.preventDefault();
          }
          if (e.code === "KeyR" && !isMod && !e.altKey && !e.shiftKey) {
            state.selectedElementIds.forEach((id) =>
              state.updateElement(id, {
                rotation: (el.rotation || 0) + 90,
              }),
            );
            e.preventDefault();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
        setBodyCursor("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    setIsSpacePressed,
    setIsPanning,
    setIsShortcutsModalOpen,
    setIsContentModalOpen,
    setBodyCursor,
    mainRef,
  ]);
}
