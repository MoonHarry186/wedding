import React, { useRef } from "react";
import {
  RiFileCopyLine,
  RiDeleteBin6Line,
  RiDragMoveFill,
  RiRestartLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { useDrag } from "@/hooks/useDrag";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";
import { ResizeHandle } from "./ResizeHandle";
import type {
  CanvasElement,
  TextElement as TextElementType,
} from "@/types/editor";

function setBodyCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

interface ElementControlsProps {
  element: CanvasElement;
  zoom: number;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ElementControls({
  element,
  zoom,
  onUpdate,
  onDuplicate,
  onDelete,
}: ElementControlsProps) {
  const { pushHistory, setIsDraggingOrResizing } = useEditorStore();
  const controlsRef = useRef<HTMLDivElement>(null);
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  const handleDrag = useDrag(
    (x, y) => {
      const el = document.getElementById(`element-${element.id}`);
      if (el) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      }
      if (controlsRef.current) {
        controlsRef.current.style.left = `${x}px`;
        controlsRef.current.style.top = `${y}px`;
      }
    },
    zoom,
    () => {
      setIsDraggingOrResizing(true);
      beginDrag([element.id]);
      pushHistory("Di chuyển phần tử");
    },
    (x, y) => {
      setIsDraggingOrResizing(false);
      clearGuides();
      onUpdate({ x: Math.round(x), y: Math.round(y) });
    },
  );

  const handleResizeStart = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOrResizing(true);
    beginDrag([element.id]);
    pushHistory("Thay đổi kích thước");

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startXPos = element.x;
    const startYPos = element.y;
    const startFontSize = (element as TextElementType).fontSize || 0;
    const aspectRatio = startWidth / startHeight;

    const el = document.getElementById(`element-${element.id}`);

    let lastResizeValues: {
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
    } | null = null;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      const isCorner = type.includes("-");
      const keepRatio =
        moveEvent.shiftKey ||
        element.type === "text" ||
        (element.type === "group" && isCorner);

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;

      // Handle specific edge handles
      if (type === "right") {
        newWidth = Math.max(10, startWidth + dx);
        if (keepRatio) {
          newHeight = newWidth / aspectRatio;
          newY = startYPos - (newHeight - startHeight) / 2;
        }
      }
      if (type === "left") {
        const delta = Math.min(startWidth - 10, dx);
        newWidth = startWidth - delta;
        newX = startXPos + delta;
        if (keepRatio) {
          newHeight = newWidth / aspectRatio;
          newY = startYPos - (newHeight - startHeight) / 2;
        }
      }
      if (type === "bottom") {
        newHeight = Math.max(10, startHeight + dy);
        if (keepRatio) {
          newWidth = newHeight * aspectRatio;
          newX = startXPos - (newWidth - startWidth) / 2;
        }
      }
      if (type === "top") {
        const delta = Math.min(startHeight - 10, dy);
        newHeight = startHeight - delta;
        newY = startYPos + delta;
        if (keepRatio) {
          newWidth = newHeight * aspectRatio;
          newX = startXPos - (newWidth - startWidth) / 2;
        }
      }

      // Handle corner handles
      if (type === "bottom-right") {
        newWidth = Math.max(10, startWidth + dx);
        newHeight = Math.max(10, startHeight + dy);
        if (keepRatio) {
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
          }
        }
      }
      if (type === "bottom-left") {
        const dX = Math.min(startWidth - 10, dx);
        newWidth = startWidth - dX;
        newX = startXPos + dX;
        newHeight = Math.max(10, startHeight + dy);
        if (keepRatio) {
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
            newX = startXPos + (startWidth - newWidth);
          } else {
            newHeight = newWidth / aspectRatio;
          }
        }
      }
      if (type === "top-right") {
        newWidth = Math.max(10, startWidth + dx);
        const dY = Math.min(startHeight - 10, dy);
        newHeight = startHeight - dY;
        newY = startYPos + dY;
        if (keepRatio) {
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
            newY = startYPos + (startHeight - newHeight);
          }
        }
      }
      if (type === "top-left") {
        const dX = Math.min(startWidth - 10, dx);
        newWidth = startWidth - dX;
        newX = startXPos + dX;
        const dY = Math.min(startHeight - 10, dy);
        newHeight = startHeight - dY;
        newY = startYPos + dY;
        if (keepRatio) {
          if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
            newX = startXPos + (startWidth - newWidth);
          } else {
            newHeight = newWidth / aspectRatio;
            newY = startYPos + (startHeight - newHeight);
          }
        }
      }

      let newFontSize = startFontSize;
      if (element.type === "text" && startWidth > 0) {
        const scale = newWidth / startWidth;
        newFontSize = Math.max(4, startFontSize * scale);
      }

      const snapped = snapPosition({
        activeId: element.id,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });

      if (type.includes("left")) {
        const right = newX + newWidth;
        newX = snapped.x;
        newWidth = Math.max(10, right - newX);
      } else if (type.includes("right")) {
        newWidth = Math.max(10, snapped.x + newWidth - newX);
      }

      if (type.includes("top")) {
        const bottom = newY + newHeight;
        newY = snapped.y;
        newHeight = Math.max(10, bottom - newY);
      } else if (type.includes("bottom")) {
        newHeight = Math.max(10, snapped.y + newHeight - newY);
      }

      // Update DOM Directly
      if (el) {
        el.style.width = `${newWidth}px`;
        el.style.height = `${newHeight}px`;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;

        if (element.type === "text") {
          const contentDiv = el.querySelector("div");
          if (contentDiv) {
            contentDiv.style.fontSize = `${newFontSize}px`;
          }
        }

        // Visual scale children if it's a group
        if (element.type === "group" && startWidth > 0 && startHeight > 0) {
          const scaleX = newWidth / startWidth;
          const scaleY = newHeight / startHeight;

          const updateDescendantsDOM = (
            childIds: string[],
            sX: number,
            sY: number,
          ) => {
            childIds.forEach((childId) => {
              const childEl = document.getElementById(`element-${childId}`);
              const childData = useEditorStore
                .getState()
                .elements.find((e) => e.id === childId);

              if (childEl && childData) {
                childEl.style.left = `${childData.x * sX}px`;
                childEl.style.top = `${childData.y * sY}px`;
                childEl.style.width = `${childData.width * sX}px`;

                // Only force height for non-text elements.
                // For text, we want it to stay fit-content to avoid clipping.
                if (childData.type !== "text") {
                  childEl.style.height = `${childData.height * sY}px`;
                }

                if (childData.type === "text") {
                  const textDiv = childEl.querySelector("div");
                  if (textDiv && (childData as TextElementType).fontSize) {
                    // Only scale font size if we are scaling uniformly (or nearly uniformly)
                    const isUniform = Math.abs(sX - sY) < 0.01;
                    if (isUniform) {
                      textDiv.style.fontSize = `${(childData as TextElementType).fontSize * sX}px`;
                    } else {
                      // If non-uniform, keep font size but let width change for wrapping
                      textDiv.style.fontSize = `${(childData as TextElementType).fontSize}px`;
                    }
                  }
                }

                // Recurse for nested groups
                if (childData.type === "group" && childData.childIds) {
                  updateDescendantsDOM(childData.childIds, sX, sY);
                }
              }
            });
          };

          if (element.childIds) {
            updateDescendantsDOM(element.childIds, scaleX, scaleY);
          }
        }
      }
      if (controlsRef.current) {
        controlsRef.current.style.width = `${newWidth}px`;
        controlsRef.current.style.height = `${newHeight}px`;
        controlsRef.current.style.left = `${newX}px`;
        controlsRef.current.style.top = `${newY}px`;
      }

      // Store current values for mouseup
      lastResizeValues = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        fontSize: newFontSize,
      };
    };

    const onMouseUp = () => {
      const last = lastResizeValues;
      clearGuides();
      if (last) {
        const updates: Partial<CanvasElement> & { fontSize?: number } = {
          x: Math.round(last.x),
          y: Math.round(last.y),
          width: Math.round(last.width),
          height: Math.round(last.height),
        };
        if (element.type === "text") {
          updates.fontSize = Math.round(last.fontSize * 10) / 10; // 1 decimal place
        }
        onUpdate(updates as Partial<CanvasElement>);
      }
      setIsDraggingOrResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setBodyCursor("");
    };

    const cursorMap: Record<string, string> = {
      "top-left": "nwse-resize",
      "bottom-right": "nwse-resize",
      "top-right": "nesw-resize",
      "bottom-left": "nesw-resize",
      top: "ns-resize",
      bottom: "ns-resize",
      left: "ew-resize",
      right: "ew-resize",
    };

    setBodyCursor(cursorMap[type] || "pointer");
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleRotateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOrResizing(true);
    pushHistory("Xoay phần tử");

    const el = document.getElementById(`element-${element.id}`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startX = e.clientX;
    const startY = e.clientY;
    const startAngle = Math.atan2(startY - centerY, startX - centerX);
    const baseAngle = element.rotation || 0;

    let lastRotation: number | undefined;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX,
      );
      const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
      const newRotation = Math.round(baseAngle + deltaAngle);

      // Update DOM Directly
      if (el) el.style.transform = `rotate(${newRotation}deg)`;
      if (controlsRef.current)
        controlsRef.current.style.transform = `rotate(${newRotation}deg)`;

      lastRotation = newRotation;
    };

    const onMouseUp = () => {
      if (lastRotation !== undefined) {
        onUpdate({ rotation: lastRotation });
      }
      setIsDraggingOrResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setBodyCursor("");
    };

    setBodyCursor("grabbing");
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      id="element-controls"
      ref={controlsRef}
      className="absolute pointer-events-none z-[1000] border border-primary/50"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      {/* Selection Border Glow */}
      <div className="absolute inset-0 border border-primary/20 ring-4 ring-primary/5 pointer-events-none" />

      {/* Resize Handles */}
      <ResizeHandle type="top-left" onResizeStart={handleResizeStart} />
      <ResizeHandle type="top-right" onResizeStart={handleResizeStart} />
      <ResizeHandle type="bottom-left" onResizeStart={handleResizeStart} />
      <ResizeHandle type="bottom-right" onResizeStart={handleResizeStart} />
      <ResizeHandle type="top" onResizeStart={handleResizeStart} />
      <ResizeHandle type="bottom" onResizeStart={handleResizeStart} />
      <ResizeHandle type="left" onResizeStart={handleResizeStart} />
      <ResizeHandle type="right" onResizeStart={handleResizeStart} />

      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center bg-white border border-[#eceef0] rounded-full shadow-lg px-3 py-1.5 gap-3 pointer-events-auto animate-in fade-in zoom-in duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(element.id);
          }}
          className="text-slate-600 hover:text-[#070235] transition-colors flex items-center justify-center p-0.5"
        >
          <RiFileCopyLine size={16} />
        </button>
        <div className="w-px h-3 bg-slate-200" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="text-slate-600 hover:text-red-500 transition-colors flex items-center justify-center p-0.5"
        >
          <RiDeleteBin6Line size={16} />
        </button>
      </div>

      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
        <div
          onMouseDown={(e) => handleDrag(e, element.x, element.y)}
          className="w-8 h-8 flex items-center justify-center bg-white border border-[#eceef0] rounded-full shadow-md text-slate-600 cursor-move hover:bg-slate-50 transition-colors"
        >
          <RiDragMoveFill size={16} />
        </div>
        <div
          onMouseDown={handleRotateClick}
          className="w-8 h-8 flex items-center justify-center bg-white border border-[#eceef0] rounded-full shadow-md text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <RiRestartLine size={16} className="scale-x-[-1]" />
        </div>
      </div>
    </div>
  );
}
