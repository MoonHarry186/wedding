"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  GroupElement as GroupElementType,
  CanvasElement,
} from "@/types/editor";
import { useDrag } from "@/hooks/useDrag";
import { useEditorStore } from "@/store/editor.store";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { getElementAnimationStyle } from "@/lib/editorAnimation";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";
import { TextElement } from "./TextElement";
import { ImageElement } from "./ImageElement";

interface GroupElementProps {
  element: GroupElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<GroupElementType>) => void;
  pointerEvents?: "auto" | "none" | "inherit";
  isReadOnly?: boolean;
  overrideElements?: CanvasElement[];
}

export function GroupElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  pointerEvents = "auto",
  isReadOnly = false,
  overrideElements,
}: GroupElementProps) {
  const {
    zoom,
    pushHistory,
    elements: storeElements,
    updateElement,
    setIsDraggingOrResizing,
  } = useEditorStore();

  const allElements = overrideElements || storeElements;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useElementAnimation(containerRef);
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  // Drag the group as a whole
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
      const el = document.getElementById(`element-${element.id}`);
      if (el) {
        el.style.left = `${snapped.x}px`;
        el.style.top = `${snapped.y}px`;
      }
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
      pushHistory("Di chuyển nhóm");
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

  // Children rendered inside the group (relative coordinates)
  const children = allElements.filter((el) => el.groupId === element.id);
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
        !element.isLocked ? "cursor-move" : "cursor-default",
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
      <div className="absolute inset-0" style={animationStyle}>
        {/* Children */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {children.map((child) => {
            const childProps = {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              element: child as any,
              isSelected: false,
              onSelect: () => {},
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onUpdate: (updates: any) => updateElement(child.id, updates),
              pointerEvents: "none" as const,
            };

            if (child.type === "text")
              return <TextElement key={child.id} {...childProps} />;
            if (child.type === "image")
              return <ImageElement key={child.id} {...childProps} />;
            if (child.type === "group")
              return (
                <GroupElement
                  key={child.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  element={child as any}
                  isSelected={false}
                  onSelect={() => {}}
                  onUpdate={(updates) => updateElement(child.id, updates)}
                  pointerEvents="none"
                  isReadOnly={isReadOnly}
                  overrideElements={allElements}
                />
              );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
