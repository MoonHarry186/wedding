"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ImageElement as ImageElementType } from "@/types/editor";
import { RiImageLine } from "@remixicon/react";
import { useDrag } from "@/hooks/useDrag";
import { useEditorStore } from "@/store/editor.store";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { getElementAnimationStyle } from "@/lib/editorAnimation";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";

interface ImageElementProps {
  element: ImageElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<ImageElementType>) => void;
  pointerEvents?: "auto" | "none" | "inherit";
  isReadOnly?: boolean;
}

export function ImageElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  pointerEvents = "auto",
  isReadOnly = false,
}: ImageElementProps) {
  const { zoom, pushHistory, setIsDraggingOrResizing } = useEditorStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useElementAnimation(containerRef);
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  const handleMouseDown = useDrag(
    (x, y) => {
      if (isReadOnly) return;
      const snapped = snapPosition({
        activeId: element.id,
        x,
        y,
        width: element.width,
        height: element.height,
      });
      // 1. Update Element DOM
      const el = document.getElementById(`element-${element.id}`);
      if (el) {
        el.style.left = `${snapped.x}px`;
        el.style.top = `${snapped.y}px`;
      }
      // 2. Update Controls DOM
      const controls = document.getElementById("element-controls");
      if (controls) {
        controls.style.left = `${snapped.x}px`;
        controls.style.top = `${snapped.y}px`;
      }
    },
    zoom,
    () => {
      setIsDraggingOrResizing(true);
      beginDrag([element.id]);
      pushHistory("Di chuyển hình ảnh");
    },
    (x, y) => {
      setIsDraggingOrResizing(false);
      const snapped = snapPosition({
        activeId: element.id,
        x,
        y,
        width: element.width,
        height: element.height,
      });
      clearGuides();
      onUpdate({ x: Math.round(snapped.x), y: Math.round(snapped.y) });
    },
  );

  const animationStyle = React.useMemo(
    () => getElementAnimationStyle(element, isVisible),
    [element, isVisible],
  );

  return (
    <div
      id={`element-${element.id}`}
      ref={containerRef}
      onMouseDown={(e) => {
        if (isReadOnly) return;
        onSelect?.(e);
        if (!element.isLocked) {
          handleMouseDown(e, element.x, element.y);
        }
      }}
      className={cn(
        "editor-hover-outline-target absolute select-none",
        element.isLocked ? "cursor-default" : "cursor-move",
        isSelected && "",
      )}
      data-selected={isSelected ? "true" : "false"}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
        pointerEvents: pointerEvents,
      }}
    >
      <div
        className={cn(
          "w-full h-full relative overflow-hidden",
          !element.url && "flex items-center justify-center",
        )}
        style={{
          backgroundColor: element.backgroundColor || "transparent",
          padding: element.paddingSettings
            ? `${element.paddingSettings.top}px ${element.paddingSettings.right}px ${element.paddingSettings.bottom}px ${element.paddingSettings.left}px`
            : undefined,
          borderTop:
            element.border?.enabled &&
            (!element.border.sides || element.border.sides.includes("top"))
              ? `${element.border.width}px ${element.border.style} ${element.border.color}`
              : "none",
          borderRight:
            element.border?.enabled &&
            (!element.border.sides || element.border.sides.includes("right"))
              ? `${element.border.width}px ${element.border.style} ${element.border.color}`
              : "none",
          borderBottom:
            element.border?.enabled &&
            (!element.border.sides || element.border.sides.includes("bottom"))
              ? `${element.border.width}px ${element.border.style} ${element.border.color}`
              : "none",
          borderLeft:
            element.border?.enabled &&
            (!element.border.sides || element.border.sides.includes("left"))
              ? `${element.border.width}px ${element.border.style} ${element.border.color}`
              : "none",
          borderRadius: element.border
            ? `${element.border.radiusTopLeft || 0}px ${element.border.radiusTopRight || 0}px ${element.border.radiusBottomRight || 0}px ${element.border.radiusBottomLeft || 0}px`
            : undefined,
          boxShadow: element.boxShadow?.enabled
            ? `${element.boxShadow.offsetX}px ${element.boxShadow.offsetY}px ${element.boxShadow.blur}px ${element.boxShadow.color}`
            : undefined,
          clipPath:
            element.clipShape && element.clipShape !== "none"
              ? element.clipShape
              : undefined,
          ...animationStyle,
        }}
      >
        {element.url ? (
          element.cropData ? (
            <img
              src={element.url}
              alt="Canvas Element"
              draggable={false}
              style={{
                position: "absolute",
                width: `${100 / element.cropData.width}%`,
                height: `${100 / element.cropData.height}%`,
                left: `${(-element.cropData.x / element.cropData.width) * 100}%`,
                top: `${(-element.cropData.y / element.cropData.height) * 100}%`,
                objectFit: "fill",
                maxWidth: "none",
                maxHeight: "none",
                display: "block",
              }}
            />
          ) : (
            <img
              src={element.url}
              alt="Canvas Element"
              className="w-full h-full"
              style={{ objectFit: element.objectFit, borderRadius: "inherit" }}
              draggable={false}
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 italic border border-dashed border-gray-200">
            <RiImageLine size={32} />
            <span className="text-[10px]">Chưa có ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
}
