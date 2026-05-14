import React, { useRef, useEffect, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Popover,
  Switch,
  InputNumber,
  Dropdown,
  Modal,
  MenuProps,
  App,
} from "antd";
import {
  RiArrowDownSLine,
  RiGridLine,
  RiPaletteLine,
  RiRulerLine,
  RiSettings4Line,
  RiAddCircleFill,
  RiIndeterminateCircleFill,
  RiStackLine,
  RiFileCopyLine,
  RiDeleteBin6Line,
  RiArrowUpLine,
  RiArrowUpSLine,
  RiArrowDownLine,
  RiLockLine,
  RiLockUnlockLine,
  RiRestartLine,
  RiAddLine,
  RiSubtractLine,
  RiMagicLine,
  RiQuestionLine,
  RiImageLine,
  RiArrowGoBackLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import {
  DEFAULT_EDITOR_PREVIEW_DEVICE_ID,
  EDITOR_PREVIEW_DEVICES,
} from "@/constants/editorPreviewDevices";
import { usePublishTemplate } from "@/hooks/useTemplates";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useMarqueeSelection } from "@/hooks/useMarqueeSelection";
import { cn } from "@/lib/utils";
import type {
  CanvasData,
  CanvasElement,
} from "@/types/editor";
import { ScaledCanvasPreviewRenderer } from "@/components/invitations/ScaledCanvasPreviewRenderer";
import { TextElement } from "./elements/TextElement";
import { ImageElement } from "./elements/ImageElement";
import { GroupElement } from "./elements/GroupElement";
import { WidgetElement } from "./elements/WidgetElement";
import { SmartGuideOverlay } from "./SmartGuideOverlay";

const MUSIC_ICONS = [
  { id: "note", emoji: "🎵" },
  { id: "disc", emoji: "💿" },
  { id: "heart", emoji: "💝" },
  { id: "star", emoji: "✨" },
  { id: "rose", emoji: "🌹" },
];

import { ElementControls } from "./ElementControls";
import { MultiSelectionBox } from "./MultiSelectionBox";

// --- Helpers ---

function setBodyCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

// --- Main Editor Canvas Component ---

export const EditorCanvas = () => {
  const { id } = useParams();
  const templateId = id as string;
  const {
    elements,
    selectedElementIds,
    setSelectedElementIds,
    activeTool,
    setActiveTool,
    setActivePanel,
    updateElement,
    addElement,
    zoom,
    setZoom,
    canvasHeight,
    setCanvasHeight,
    gridVisible,
    setGridVisible,
    gridSize,
    setGridSize,
    gridColor,
    setGridColor,
    smartGuidesEnabled,
    setSmartGuidesEnabled,
    updateElements,
    duplicateElement,
    deleteElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    toggleLock,
    pushHistory,
    addBackup,
    previewMode,
    previewDeviceId,
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    backgroundAttachment,
    bgMusicUrl,
    musicIcon,
    musicIconColor,
    editorTheme,
  } = useEditorStore();

  const publishTemplate = usePublishTemplate();

  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Rubber-band (marquee) selection
  const {
    marquee,
    handlePageMouseDown,
    shouldSuppressNextCanvasClickRef,
  } = useMarqueeSelection(canvasContainerRef, zoom);

  const mainRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ scrollLeft: 0, scrollTop: 0, x: 0, y: 0 });

  // Wheel Zoom Logic
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomStep = 0.1;
        const newZoom =
          delta < 0
            ? Math.min(3, zoom + zoomStep)
            : Math.max(0.5, zoom - zoomStep);

        if (newZoom !== zoom && mainRef.current) {
          const container = mainRef.current;
          const rect = container.getBoundingClientRect();

          // Check if mouse is within the container
          const isMouseOverContainer =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;

          if (isMouseOverContainer) {
            // Mouse position relative to container viewport
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Mouse position in content coordinates (unscaled)
            const contentX = (mouseX + container.scrollLeft) / zoom;
            const contentY = (mouseY + container.scrollTop) / zoom;

            const newScrollLeft = contentX * newZoom - mouseX;
            const newScrollTop = contentY * newZoom - mouseY;

            setZoom(newZoom);

            // Immediate scroll sync for precision
            requestAnimationFrame(() => {
              container.scrollLeft = newScrollLeft;
              container.scrollTop = newScrollTop;
            });
          } else {
            // Zoom normally (without scroll adjustment) if mouse is outside
            setZoom(newZoom);
          }
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [zoom, setZoom]);

  // Panning Logic
  // Panning Logic and Background Click
  const handleMainMouseDown = (e: React.MouseEvent) => {
    // If clicking directly on the main wrapper (the gray area outside the canvas)
    if (e.target === e.currentTarget) {
      if (!isSpacePressed) {
        setSelectedElementIds([]);
        return;
      }
    }

    if (!isSpacePressed) return;

    setIsPanning(true);
    setBodyCursor("grabbing");

    if (mainRef.current) {
      panStartRef.current = {
        scrollLeft: mainRef.current.scrollLeft,
        scrollTop: mainRef.current.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };
    }
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (mainRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        mainRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
        mainRef.current.scrollTop = panStartRef.current.scrollTop - dy;
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      if (isSpacePressed) {
        setBodyCursor("grab");
      } else {
        setBodyCursor("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning, isSpacePressed]);

  // Refs for imperative control
  const pageRootRef = useRef<HTMLDivElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const resizeStateRef = useRef({
    isResizing: false,
    startY: 0,
    startHeight: 0,
  });
  const rafIdRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // 1. Draw Grid Canvas Imperatively
  const drawGrid = useCallback(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas || !gridVisible) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 500; // Fixed page width
    const height = pageRootRef.current?.offsetHeight || canvasHeight;

    // Set canvas dimensions (actual pixels)
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = `${gridColor}33`; // 20% opacity
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }, [gridVisible, gridSize, gridColor, canvasHeight]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  useEffect(() => {
    if (previewMode || !gridVisible) return;

    const rafId = requestAnimationFrame(() => {
      drawGrid();
    });

    return () => cancelAnimationFrame(rafId);
  }, [previewMode, gridVisible, drawGrid]);

  // 2. High-Performance Resize Logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pushHistory("Thay đổi chiều cao trang");

    resizeStateRef.current = {
      isResizing: true,
      startY: e.clientY,
      startHeight: pageRootRef.current?.offsetHeight || canvasHeight,
    };

    setBodyCursor("ns-resize");

    const handleResizeMove = (moveEvent: MouseEvent) => {
      if (!resizeStateRef.current.isResizing) return;

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        const dy = (moveEvent.clientY - resizeStateRef.current.startY) / zoom;
        const newHeight = Math.max(
          400,
          Math.min(20000, resizeStateRef.current.startHeight + dy),
        );

        // Update DOM directly (No React re-render)
        if (pageRootRef.current) {
          pageRootRef.current.style.height = `${newHeight}px`;
        }

        // Update Grid Canvas directly
        if (gridCanvasRef.current) {
          gridCanvasRef.current.height = newHeight;
          drawGrid(); // Re-draw at new height
        }
      });
    };

    const handleResizeEnd = (upEvent: MouseEvent) => {
      if (!resizeStateRef.current.isResizing) return;

      const dy = (upEvent.clientY - resizeStateRef.current.startY) / zoom;
      const finalHeight = Math.max(
        400,
        Math.min(20000, resizeStateRef.current.startHeight + dy),
      );

      // 3. Sync final height back to React state ONLY on mouseup
      setCanvasHeight(finalHeight);

      resizeStateRef.current.isResizing = false;
      setBodyCursor("");
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPhotoStripOpen, setIsPhotoStripOpen] = useState(false);

  useEditorShortcuts({
    templateId,
    publishTemplate,
    mainRef,
    setIsSpacePressed,
    setIsPanning,
    setIsShortcutsModalOpen,
    setIsContentModalOpen,
    setBodyCursor: (cursor) => { document.body.style.cursor = cursor; },
  });

  const imageElements = elements.filter((el) => el.type === "image");
  const textElements = elements.filter((el) => el.type === "text");
  const previewDevice =
    EDITOR_PREVIEW_DEVICES.find((device) => device.id === previewDeviceId) ??
    EDITOR_PREVIEW_DEVICES.find(
      (device) => device.id === DEFAULT_EDITOR_PREVIEW_DEVICE_ID,
    ) ??
    EDITOR_PREVIEW_DEVICES[0];
  const previewCanvasData: CanvasData = {
    elements,
    canvasHeight,
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundRepeat,
    backgroundPosition,
    backgroundAttachment,
  };
  const isWebPreview = previewDevice.id === "web";
  const useOuterPreviewScroll = previewMode && isWebPreview;

  const scrollToElement = (id: string) => {
    setSelectedElementIds([id]);
    const el = document.getElementById(`element-${id}`);
    if (el && mainRef.current) {
      // Cuộn phần tử vào chính giữa viewport của editor
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (shouldSuppressNextCanvasClickRef.current) {
      shouldSuppressNextCanvasClickRef.current = false;
      return;
    }

    // e.currentTarget is page-root-container. If target is the same, we clicked the white background.
    if (e.target === e.currentTarget) {
      if (activeTool === "text") {
        // Get relative coordinates
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        addElement("text", { x: Math.round(x - 100), y: Math.round(y - 25) });
        setActiveTool("select"); // Switch back after adding
      } else {
        setSelectedElementIds(["canvas"]);
      }
    }
  };

  // handlePageMouseDown is provided by useMarqueeSelection hook above

  const canvasMenuItems: MenuProps["items"] = [
    {
      key: "layers",
      label: "Quản lý lớp (Layers)",
      icon: <RiStackLine size={16} />,
      onClick: () => setActivePanel("layers"),
    },
    {
      key: "history",
      label: "Lịch sử thay đổi",
      icon: <RiArrowGoBackLine size={16} />,
      onClick: () => setActivePanel("history"),
    },
    { type: "divider" },
    {
      key: "grid",
      label: gridVisible ? "Ẩn lưới (Grid)" : "Hiện lưới (Grid)",
      icon: <RiGridLine size={16} />,
      onClick: () => setGridVisible(!gridVisible),
    },
    {
      key: "edit",
      label: "Chỉnh sửa nội dung",
      icon: <RiMagicLine size={16} />,
      onClick: () => setIsContentModalOpen(true),
    },
  ];
  const dropdownTriggers: ("contextMenu")[] | [] = previewMode
    ? []
    : ["contextMenu"];

  const pageRootNode = (
    <div
      ref={(node) => {
        (
          pageRootRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
        (
          canvasContainerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
      }}
      id="page-root-container"
      className={cn(
        "relative w-[500px] shadow-2xl overflow-visible transition-[height] duration-0",
        activeTool === "text" ? "cursor-text" : "cursor-auto",
      )}
      style={{
        height: `${canvasHeight}px`,
        backgroundColor: backgroundImage
          ? "transparent"
          : backgroundColor.startsWith("linear-gradient")
            ? "transparent"
            : backgroundColor,
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : backgroundColor.startsWith("linear-gradient")
            ? backgroundColor
            : "none",
        backgroundSize: backgroundSize,
        backgroundRepeat: backgroundRepeat,
        backgroundPosition: backgroundPosition,
        backgroundAttachment: backgroundAttachment,
      }}
      onClick={previewMode ? undefined : handleCanvasClick}
      onMouseDown={previewMode ? undefined : handlePageMouseDown}
    >
      {gridVisible && (
        <canvas
          ref={gridCanvasRef}
          id="grid-canvas"
          className="absolute inset-0 pointer-events-none rounded opacity-50"
        />
      )}

      <SmartGuideOverlay />

      {marquee && marquee.width > 2 && marquee.height > 2 && (
        <div
          className="absolute border border-primary bg-primary/10 z-[100] pointer-events-none rounded"
          style={{
            left: marquee.x,
            top: marquee.y,
            width: marquee.width,
            height: marquee.height,
          }}
        />
      )}

      {bgMusicUrl && (
        <div
          className="absolute top-5 right-5 z-[100] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-300"
          style={{
            backgroundColor: musicIconColor,
            boxShadow: `0 8px 20px -4px ${musicIconColor}40`,
          }}
        >
          <span className="text-2xl transform hover:scale-110 transition-transform cursor-pointer drop-shadow-md">
            {MUSIC_ICONS.find((i) => i.id === musicIcon)?.emoji || "🎵"}
          </span>

          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: musicIconColor }}
          />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        {[...elements]
          .filter((el) => !el.groupId)
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((element) => {
            const menuItems: MenuProps["items"] = [
              {
                key: "layers",
                label: (
                  <span className="font-bold text-[#070235]">
                    Hiển thị các lớp
                  </span>
                ),
                icon: <RiStackLine size={16} />,
                onClick: () => setActivePanel("layers"),
              },
              { type: "divider" },
              {
                key: "duplicate",
                label: "Tạo bản sao",
                icon: <RiFileCopyLine size={16} />,
                onClick: () => duplicateElement(element.id),
              },
              {
                key: "delete",
                label: "Xoá phần tử",
                icon: <RiDeleteBin6Line size={16} />,
                danger: true,
                onClick: () => deleteElement(element.id),
              },
              { type: "divider" },
              {
                key: "order",
                label: "Chỉnh thứ tự lớp",
                icon: <RiStackLine size={16} />,
                children: [
                  {
                    key: "front",
                    label: "Đưa lên trên cùng",
                    icon: <RiArrowUpLine size={16} />,
                    onClick: () => bringToFront(element.id),
                  },
                  {
                    key: "forward",
                    label: "Đưa lên 1 lớp",
                    icon: <RiArrowUpSLine size={16} />,
                    onClick: () => bringForward(element.id),
                  },
                  {
                    key: "backward",
                    label: "Đưa xuống 1 lớp",
                    icon: <RiArrowDownSLine size={16} />,
                    onClick: () => sendBackward(element.id),
                  },
                  {
                    key: "back",
                    label: "Đưa xuống dưới cùng",
                    icon: <RiArrowDownLine size={16} />,
                    onClick: () => sendToBack(element.id),
                  },
                ],
              },
              {
                key: "lock",
                label: element.isLocked ? "Mở khoá vị trí" : "Khoá vị trí",
                icon: element.isLocked ? (
                  <RiLockUnlockLine size={16} />
                ) : (
                  <RiLockLine size={16} />
                ),
                onClick: () => toggleLock(element.id),
              },
            ];

            const isSelected = selectedElementIds.includes(element.id);
            const onSelect = (e: React.MouseEvent) => {
              if (e.shiftKey) {
                const next = selectedElementIds.includes(element.id)
                  ? selectedElementIds.filter((id) => id !== element.id)
                  : [...selectedElementIds, element.id];
                setSelectedElementIds(next);
              } else {
                setSelectedElementIds([element.id]);
              }
            };
            const onUpdate = (updates: Partial<CanvasElement>) =>
              updateElement(element.id, updates);

            const elementNode = (() => {
              if (element.type === "text")
                return (
                  <TextElement
                    key={`${element.id}-${previewMode}`}
                    element={element}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    isReadOnly={previewMode}
                    onUpdate={
                      onUpdate as Parameters<typeof TextElement>[0]["onUpdate"]
                    }
                  />
                );
              if (element.type === "image")
                return (
                  <ImageElement
                    key={`${element.id}-${previewMode}`}
                    element={element}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    isReadOnly={previewMode}
                    onUpdate={
                      onUpdate as Parameters<typeof ImageElement>[0]["onUpdate"]
                    }
                  />
                );
              if (element.type === "group")
                return (
                  <GroupElement
                    key={`${element.id}-${previewMode}`}
                    element={element}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    isReadOnly={previewMode}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                  />
                );
              if (element.type === "widget")
                return (
                  <WidgetElement
                    key={`${element.id}-${previewMode}`}
                    element={element}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onUpdate={(updates) => updateElement(element.id, updates)}
                  />
                );
              return null;
            })();

            return (
              <React.Fragment key={element.id}>
                <Dropdown menu={{ items: menuItems }} trigger={dropdownTriggers}>
                  <div
                    className="pointer-events-auto contents"
                    onContextMenu={(e) => e.stopPropagation()}
                  >
                    {elementNode}
                  </div>
                </Dropdown>

                {selectedElementIds.includes(element.id) &&
                  selectedElementIds.length === 1 &&
                  !element.isLocked && (
                    <ElementControls
                      element={element}
                      zoom={zoom}
                      onUpdate={(updates) => updateElement(element.id, updates)}
                      onDuplicate={duplicateElement}
                      onDelete={deleteElement}
                    />
                  )}
              </React.Fragment>
            );
          })}
      </div>

      {selectedElementIds.length > 1 && (
        <MultiSelectionBox
          selectedIds={selectedElementIds}
          elements={elements}
          zoom={zoom}
          onUpdateAll={updateElements}
          onDeleteAll={() =>
            selectedElementIds.forEach((id) => deleteElement(id))
          }
          onDuplicateAll={() =>
            selectedElementIds.forEach((id) => duplicateElement(id))
          }
        />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex-1 flex flex-col overflow-hidden transition-colors editor-canvas-shell",
        editorTheme === "dark" ? "bg-[#0b1120]" : "bg-[#d9d9d9]",
      )}
    >
      <Dropdown menu={{ items: canvasMenuItems }} trigger={dropdownTriggers}>
        <main
          ref={mainRef}
          onMouseDown={handleMainMouseDown}
          className={cn(
            "flex-1 relative flex flex-col items-center custom-scrollbar",
            previewMode
              ? useOuterPreviewScroll
                ? "overflow-auto py-8"
                : "overflow-hidden py-8 justify-center"
              : "overflow-auto py-14",
            isSpacePressed ? "cursor-grab" : "cursor-auto",
            isPanning && "cursor-grabbing",
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          {/* 2. Zoom Wrapper (CSS-driven) */}
          <div
            className="relative flex flex-col items-center origin-top"
            style={previewMode ? undefined : { transform: `scale(${zoom})` }}
            onMouseDown={(e) => {
              if (previewMode) return;
              if (e.target === e.currentTarget && !isSpacePressed) {
                setSelectedElementIds([]);
              }
            }}
          >
            {/* Floating Tools Above Canvas */}
            {!previewMode && (
              <div className="absolute top-0 -left-12 flex flex-col gap-2 z-50">
                <Popover
                  placement="bottomLeft"
                  trigger="click"
                  content={
                    <div className="w-64 p-2 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                            <RiSettings4Line size={16} />
                            <span>Bật/Tắt lưới</span>
                          </div>
                          <Switch
                            size="small"
                            checked={gridVisible}
                            onChange={setGridVisible}
                            className="bg-slate-200"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                            <RiPaletteLine size={16} />
                            <span>Màu lưới:</span>
                          </div>
                          <input
                            type="color"
                            value={gridColor}
                            onChange={(e) => setGridColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                            <RiRulerLine size={16} />
                            <span>Kích thước:</span>
                          </div>
                          <InputNumber
                            size="small"
                            min={5}
                            max={200}
                            value={gridSize}
                            onChange={(val) => setGridSize(val || 36)}
                            className="w-20"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                            <RiMagicLine size={16} />
                            <span>Smart Guides</span>
                          </div>
                          <Switch
                            size="small"
                            checked={smartGuidesEnabled}
                            onChange={setSmartGuidesEnabled}
                            className="bg-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  }
                >
                  <button
                    className={cn(
                      "bg-white border p-2 rounded-xl shadow-sm transition-all active:scale-95 editor-floating-surface",
                      gridVisible
                        ? "border-primary text-primary ring-2 ring-primary/10"
                        : "border-[#eceef0] text-slate-600",
                    )}
                    title="Bật/Tắt lưới (G)"
                  >
                    <RiGridLine size={20} />
                  </button>
                </Popover>

                <button
                  onClick={() => setIsContentModalOpen(true)}
                  className="bg-white border border-[#eceef0] p-2 rounded-xl shadow-sm text-slate-600 hover:text-primary hover:border-primary/20 transition-all active:scale-95 editor-floating-surface"
                  title="Chỉnh sửa toàn bộ nội dung (E)"
                >
                  <RiMagicLine size={20} />
                </button>

                <button
                  onClick={() => setIsShortcutsModalOpen(true)}
                  className="bg-white border border-[#eceef0] p-2 rounded-xl shadow-sm text-slate-600 hover:text-primary hover:border-primary/20 transition-all active:scale-95 editor-floating-surface"
                  title="Hướng dẫn phím tắt (Shift + ?)"
                >
                  <RiQuestionLine size={20} />
                </button>
              </div>
            )}

            {previewMode ? (
              <div
                className={cn(
                  useOuterPreviewScroll
                    ? "flex justify-center"
                    : "overflow-y-auto scrollbar-hidden",
                  isWebPreview && "items-start",
                )}
                style={{
                  width: isWebPreview ? "100%" : `${previewDevice.width}px`,
                  height: useOuterPreviewScroll
                    ? undefined
                    : `${previewDevice.height}px`,
                  scrollbarWidth: useOuterPreviewScroll ? undefined : "none",
                  msOverflowStyle: useOuterPreviewScroll ? undefined : "none",
                }}
              >
                <div
                  style={{
                    width: isWebPreview ? "100%" : `${previewDevice.width}px`,
                  }}
                >
                  <ScaledCanvasPreviewRenderer
                    key={previewDevice.id}
                    canvasData={previewCanvasData}
                    variableValues={{}}
                    viewportWidth={isWebPreview ? undefined : previewDevice.width}
                  />
                </div>
              </div>
            ) : (
              pageRootNode
            )}

            {/* 6. Resize Handle (Bottom) */}
            {!previewMode && (
              <div className="-mt-2 flex flex-col items-center gap-3 z-50">
                <div
                  onMouseDown={handleResizeStart}
                  className="w-20 h-2 bg-slate-300 rounded-full cursor-ns-resize hover:bg-primary/60 transition-colors shadow-sm"
                  title="Kéo để chỉnh chiều cao trang"
                />
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-xl border border-slate-100 editor-floating-surface">
                  <button
                    onClick={() =>
                      setCanvasHeight(Math.max(400, canvasHeight - 50))
                    }
                    className="text-slate-400 hover:text-primary transition-colors"
                  >
                    <RiIndeterminateCircleFill size={24} />
                  </button>
                  <div className="flex items-center gap-1 min-w-[80px] justify-center border-x border-slate-100 px-3">
                    <InputNumber
                      variant="borderless"
                      size="small"
                      min={400}
                      max={5000}
                      value={canvasHeight}
                      onChange={(val) => setCanvasHeight(val || 1000)}
                      className="w-16 text-center font-bold text-slate-700"
                      controls={false}
                    />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      px
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCanvasHeight(Math.min(5000, canvasHeight + 50))
                    }
                    className="text-slate-400 hover:text-primary transition-colors"
                  >
                    <RiAddCircleFill size={24} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </Dropdown>

      {/* Overlays (within gray area) */}
      {!previewMode && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center bg-white border border-[#eceef0] rounded-2xl shadow-xl z-50 p-1 gap-1 animate-in fade-in slide-in-from-right-4 duration-500 editor-floating-surface">
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"
            title="Phóng to"
          >
            <RiAddLine size={20} />
          </button>
          <div className="py-1 text-[11px] font-extrabold text-slate-700 select-none">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"
            title="Thu nhỏ"
          >
            <RiSubtractLine size={20} />
          </button>
          <div className="w-6 h-[1px] bg-slate-100 my-0.5" />
          <button
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:rotate-180 duration-500",
              zoom === 1
                ? "text-slate-200 cursor-default"
                : "text-slate-400 hover:text-primary hover:bg-primary/5",
            )}
            title="Reset về 100%"
          >
            <RiRestartLine size={18} />
          </button>
        </div>
      )}

      {/* 7. Quick Photo Strip (Bottom Overlay) */}
      {imageElements.length > 0 && !previewMode && (
        <div className="absolute bottom-0 left-0 right-0 z-[60] pointer-events-none">
          <div className="flex flex-col items-start pointer-events-auto">
            {/* Toggle Button */}
            <button
              onClick={() => setIsPhotoStripOpen(!isPhotoStripOpen)}
              className="flex items-center gap-2 bg-white/90 backdrop-blur border-t border-x border-slate-200 px-6 py-2 rounded-t-xl text-xs font-bold text-slate-600 shadow-lg hover:bg-white transition-all mb-[-1px] ml-6"
            >
              Thay ảnh nhanh ({imageElements.length})
              <RiArrowDownSLine
                className={cn(
                  "transition-transform duration-300",
                  !isPhotoStripOpen && "rotate-180",
                )}
                size={16}
              />
            </button>

            {/* Strip Content */}
            <div
              className={cn(
                "w-full bg-white/90 backdrop-blur border-t border-slate-200 shadow-2xl transition-all duration-300 overflow-hidden",
                isPhotoStripOpen
                  ? "h-28 opacity-100"
                  : "h-0 opacity-0 pointer-events-none",
              )}
            >
              <div className="h-full flex items-center gap-4 px-6 overflow-x-auto custom-scrollbar">
                {imageElements.length > 0 ? (
                  imageElements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => scrollToElement(el.id)}
                      className={cn(
                        "flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all relative group overflow-hidden bg-slate-100",
                        selectedElementIds.includes(el.id)
                          ? "border-primary ring-4 ring-primary/10"
                          : "border-transparent hover:border-slate-300",
                      )}
                    >
                      {(el as unknown as { url?: string }).url ? (
                        <img
                          src={(el as unknown as { url?: string }).url}
                          className="w-full h-full object-cover"
                          alt="Thumb"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <RiImageLine size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <RiImageLine size={20} />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic py-4 pl-4">
                    Chưa có hình ảnh nào trong thiết kế này
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <RiMagicLine size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800">
                  Chỉnh sửa nội dung
                </span>
                <RiQuestionLine size={14} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Quét và chỉnh sửa tất cả nội dung trong thiệp
              </p>
            </div>
          </div>
        }
        open={isContentModalOpen}
        onCancel={() => setIsContentModalOpen(false)}
        footer={null}
        width={720}
        centered
        className="content-edit-modal"
      >
        <div className="space-y-6 pt-4">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">
                <p className="text-slate-500">Đã tìm thấy</p>
                <p className="font-bold text-slate-800">
                  <span className="text-primary">
                    {elements.filter((e) => e.type === "text").length}
                  </span>{" "}
                  nội dung trong thiệp
                </p>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                <RiStackLine size={20} />
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
              <span className="w-4 h-4 flex items-center justify-center bg-yellow-400 text-white rounded-full not-italic">
                💡
              </span>
              Thay đổi sẽ được tự động lưu khi bạn thoát khỏi ô nhập
            </div>
          </div>

          <div className="max-h-[400px] overflow-auto pr-2 space-y-4 custom-scrollbar">
            {elements
              .filter((e) => e.type === "text")
              .map((el, index) => (
                <ContentItem
                  key={el.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  element={el as any}
                  index={index}
                  onUpdate={(val) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    updateElement(el.id, { content: val } as any)
                  }
                />
              ))}
          </div>
        </div>
      </Modal>
      {/* 8. Shortcuts Guidance Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[#070235] py-2 border-b border-slate-100 mb-4">
            <RiQuestionLine size={24} />
            <span className="text-xl font-bold">
              Hướng dẫn phím tắt chuyên nghiệp
            </span>
          </div>
        }
        open={isShortcutsModalOpen}
        onCancel={() => setIsShortcutsModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsShortcutsModalOpen(false)}
            className="bg-[#070235] h-10 px-8 rounded-lg font-bold"
          >
            Đã hiểu
          </Button>,
        ]}
        width={1000}
        centered
        className="shortcuts-modal"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 py-10">
          {/* Column 1: Tools & General */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <h4 className="text-[14px] font-extrabold text-slate-800 uppercase tracking-widest">
                Công cụ & Thao tác
              </h4>
            </div>
            <div className="space-y-5">
              <ShortcutItem
                keys={["Space", "Kéo chuột"]}
                label="Di chuyển vùng làm việc"
              />
              <ShortcutItem keys={["T"]} label="Công cụ văn bản" />
              <ShortcutItem keys={["Esc"]} label="Thoát xem trước / Hủy chọn" />
              <ShortcutItem keys={["B"]} label="Mở bảng Cài đặt nền" />
              <ShortcutItem keys={["Ctrl / ⌘", "S"]} label="Lưu thiết kế" />
              <ShortcutItem keys={["L"]} label="Mở bảng Quản lý lớp" />
              <ShortcutItem keys={["H"]} label="Mở bảng Lịch sử" />
              <ShortcutItem keys={["E"]} label="Chỉnh sửa nội dung nhanh" />
              <ShortcutItem keys={["C"]} label="Mở công cụ cắt ảnh" />
              <ShortcutItem keys={["G"]} label="Bật / Tắt lưới căn chỉnh" />
              <ShortcutItem keys={["?"]} label="Mở hướng dẫn này" />
              <ShortcutItem keys={["Home"]} label="Cuộn về đầu trang" />
            </div>
          </div>

          {/* Column 2: Editing & Arrangement */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <h4 className="text-[14px] font-extrabold text-slate-800 uppercase tracking-widest">
                Chỉnh sửa & Sắp xếp
              </h4>
            </div>
            <div className="space-y-5">
              <ShortcutItem
                keys={["Backspace", "Delete"]}
                label="Xoá phần tử"
              />
              <ShortcutItem
                keys={["Ctrl / ⌘", "A"]}
                label="Chọn tất cả phần tử"
              />
              <ShortcutItem keys={["Ctrl / ⌘", "D"]} label="Nhân bản phần tử" />
              <ShortcutItem keys={["Ctrl / ⌘", "Z"]} label="Hoàn tác (Undo)" />
              <ShortcutItem
                keys={["Ctrl / ⌘", "Shift", "Z"]}
                label="Làm lại (Redo)"
              />
              <ShortcutItem keys={["Ctrl / ⌘", "G"]} label="Gom nhóm phần tử" />
              <ShortcutItem
                keys={["Ctrl / ⌘", "Shift", "G"]}
                label="Rã nhóm phần tử"
              />
              <ShortcutItem keys={["Ctrl / ⌘", "B"]} label="In đậm văn bản" />
              <ShortcutItem
                keys={["Ctrl / ⌘", "I"]}
                label="In nghiêng văn bản"
              />
              <ShortcutItem
                keys={["Ctrl / ⌘", "U"]}
                label="Gạch chân văn bản"
              />
            </div>
          </div>

          {/* Column 3: Display & Movement */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
              <h4 className="text-[14px] font-extrabold text-slate-800 uppercase tracking-widest">
                Hiển thị & Di chuyển
              </h4>
            </div>
            <div className="space-y-5">
              <ShortcutItem keys={["Ctrl / ⌘", "+"]} label="Phóng to" />
              <ShortcutItem keys={["Ctrl / ⌘", "-"]} label="Thu nhỏ" />
              <ShortcutItem keys={["Ctrl / ⌘", "0"]} label="Reset về 100%" />
              <ShortcutItem
                keys={["Ctrl / ⌘", "Cuộn chuột"]}
                label="Zoom nhanh"
              />
              <ShortcutItem
                keys={["← ↑ → ↓"]}
                label="Di chuyển phần tử (1px)"
              />
              <ShortcutItem
                keys={["Shift", "← ↑ → ↓"]}
                label="Di chuyển phần tử (10px)"
              />
              <ShortcutItem keys={["[", "]"]} label="Xoay phần tử (15°)" />
              <ShortcutItem keys={["R"]} label="Xoay phần tử (90°)" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ShortcutItem({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-6 group">
      <span className="text-[13px] text-slate-500 font-semibold group-hover:text-slate-800 transition-colors">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {keys.map((key, i) => (
          <React.Fragment key={key}>
            <kbd className="min-w-[32px] h-8 px-2.5 flex items-center justify-center bg-white border-2 border-slate-200 rounded-lg text-[12px] font-black text-slate-700 shadow-[0_2px_0_0_rgba(226,232,240,1)] group-hover:border-primary/20 group-hover:text-primary transition-all">
              {key}
            </kbd>
            {i < keys.length - 1 && (
              <span className="text-[12px] text-slate-300 font-bold">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ContentItem({
  element,
  index,
  onUpdate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
  index: number;
  onUpdate: (val: string) => void;
}) {
  const { pushHistory } = useEditorStore();
  const [localContent, setLocalContent] = useState(element.content || "");

  // Sync if element content changes from outside (e.g. undo/redo or direct click)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalContent(element.content || "");
  }, [element.content]);

  return (
    <div className="border border-slate-100 rounded-xl p-4 hover:border-primary/20 transition-colors bg-white group">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">
          {index + 1}
        </div>
        <span className="text-sm font-bold text-slate-700">
          Nội dung #{index + 1}
        </span>
      </div>
      <textarea
        className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all text-sm text-slate-600 resize-none"
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={() => {
          if (localContent !== element.content) {
            pushHistory("Chỉnh sửa nội dung");
            onUpdate(localContent);
          }
        }}
        placeholder="Nhập nội dung..."
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-slate-400 font-medium italic">
          {localContent.length} ký tự
        </span>
        <span className="text-[10px] text-slate-300 font-medium group-focus-within:text-primary transition-colors">
          Thoát ô nhập để lưu thay đổi
        </span>
      </div>
    </div>
  );
}
