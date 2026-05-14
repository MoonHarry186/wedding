"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TextElement as TextElementType } from "@/types/editor";
import { useDrag } from "@/hooks/useDrag";
import { useEditorStore } from "@/store/editor.store";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { getElementAnimationStyle } from "@/lib/editorAnimation";
import { resolveFontFamily } from "@/lib/editorFonts";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<TextElementType>) => void;
  pointerEvents?: "auto" | "none" | "inherit";
  isReadOnly?: boolean;
}

export function TextElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  pointerEvents = "auto",
  isReadOnly = false,
}: TextElementProps) {
  const {
    zoom,
    pushHistory,
    isDraggingOrResizing,
    setIsDraggingOrResizing,
  } = useEditorStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const isFirstChangeRef = React.useRef(true);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useElementAnimation(containerRef);
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (isDraggingOrResizing) return;
      for (const entry of entries) {
        const newHeight = (entry.target as HTMLElement).offsetHeight;
        if (Math.abs(newHeight - element.height) > 1) {
          onUpdate({ height: Math.round(newHeight) });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [
    element.content,
    element.width,
    element.fontSize,
    element.lineHeight,
    element.fontFamily,
  ]);

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
      pushHistory("Di chuyển văn bản");
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
        if (!element.isLocked && !isEditing) {
          handleMouseDown(e, element.x, element.y);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isReadOnly && !element.isLocked) {
          setIsEditing(true);
        }
      }}
      className={cn(
        "editor-hover-outline-target absolute select-none",
        element.isLocked ? "cursor-default" : "cursor-move",
        isSelected && "z-[1001]",
        isEditing && "pointer-events-auto",
      )}
      data-selected={isSelected ? "true" : "false"}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: "fit-content",
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
        pointerEvents: pointerEvents,
      }}
    >
      <div
        className="w-full h-full flex flex-col justify-center overflow-hidden"
        style={{
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          fontFamily: resolveFontFamily(element.fontFamily),
          color: element.color,
          textAlign: element.textAlign,
          letterSpacing: element.letterSpacing,
          lineHeight: element.lineHeight,
          textTransform: element.textTransform,
          textDecoration: element.textDecoration,
          fontStyle: element.fontStyle,
          writingMode: element.writingMode,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          // Style additions
          backgroundColor: element.backgroundColor,
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
          textShadow: element.textShadow?.enabled
            ? `${element.textShadow.offsetX}px ${element.textShadow.offsetY}px ${element.textShadow.blur}px ${element.textShadow.color}`
            : undefined,
          boxShadow: element.boxShadow?.enabled
            ? `${element.boxShadow.offsetX}px ${element.boxShadow.offsetY}px ${element.boxShadow.blur}px ${element.boxShadow.spread || 0}px ${element.boxShadow.color}`
            : undefined,
          ...animationStyle,
        }}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full bg-transparent border-none outline-none resize-none p-0 m-0 overflow-hidden"
            style={{
              fontSize: "inherit",
              fontWeight: "inherit",
              fontFamily: "inherit",
              color: "inherit",
              textAlign: "inherit",
              letterSpacing: "inherit",
              lineHeight: "inherit",
              textTransform: "inherit",
              textDecoration: "inherit",
              fontStyle: "inherit",
              whiteSpace: "pre-wrap",
            }}
            value={element.content}
            onChange={(e) => {
              if (isFirstChangeRef.current) {
                pushHistory("Sửa văn bản");
                isFirstChangeRef.current = false;
              }
              onUpdate({ content: e.target.value });
            }}
            onBlur={() => {
              setIsEditing(false);
              isFirstChangeRef.current = true;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
                isFirstChangeRef.current = true;
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                isFirstChangeRef.current = true;
              }
              e.stopPropagation();
            }}
          />
        ) : (
          element.content
        )}
      </div>
    </div>
  );
}
