import React, { useRef } from "react";
import { RiFileCopyLine, RiDeleteBin6Line } from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { useDrag } from "@/hooks/useDrag";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";
import type { CanvasElement } from "@/types/editor";

const MULTI_PAD = 8;

interface MultiSelectionBoxProps {
  selectedIds: string[];
  elements: CanvasElement[];
  zoom: number;
  onUpdateAll: (
    updates: Array<{ id: string; changes: Partial<CanvasElement> }>,
  ) => void;
  onDeleteAll: () => void;
  onDuplicateAll: () => void;
}

export function MultiSelectionBox({
  selectedIds,
  elements,
  zoom,
  onUpdateAll,
  onDeleteAll,
  onDuplicateAll,
}: MultiSelectionBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const { pushHistory, setIsDraggingOrResizing } = useEditorStore();
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  const selected = elements.filter((el) => selectedIds.includes(el.id));

  const minX =
    selected.length >= 2 ? Math.min(...selected.map((el) => el.x)) : 0;
  const minY =
    selected.length >= 2 ? Math.min(...selected.map((el) => el.y)) : 0;
  const maxX =
    selected.length >= 2
      ? Math.max(...selected.map((el) => el.x + el.width))
      : 0;
  const maxY =
    selected.length >= 2
      ? Math.max(...selected.map((el) => el.y + el.height))
      : 0;

  const handleDrag = useDrag(
    (x, y) => {
      const snapped = snapPosition({
        activeId: "multi-selection",
        selectedIds,
        x: x + MULTI_PAD,
        y: y + MULTI_PAD,
        width: maxX - minX,
        height: maxY - minY,
      });
      const snappedDx = snapped.x - minX;
      const snappedDy = snapped.y - minY;

      if (boxRef.current) {
        boxRef.current.style.left = `${snapped.x - MULTI_PAD}px`;
        boxRef.current.style.top = `${snapped.y - MULTI_PAD}px`;
      }
      selected.forEach((el) => {
        const domEl = document.getElementById(`element-${el.id}`);
        if (domEl) {
          domEl.style.left = `${el.x + snappedDx}px`;
          domEl.style.top = `${el.y + snappedDy}px`;
        }
      });
    },
    zoom,
    () => {
      setIsDraggingOrResizing(true);
      beginDrag(selectedIds);
      pushHistory("Di chuyển nhiều phần tử");
    },
    (x, y) => {
      setIsDraggingOrResizing(false);
      const snapped = snapPosition({
        activeId: "multi-selection",
        selectedIds,
        x: x + MULTI_PAD,
        y: y + MULTI_PAD,
        width: maxX - minX,
        height: maxY - minY,
      });
      const snappedDx = snapped.x - minX;
      const snappedDy = snapped.y - minY;
      clearGuides();
      onUpdateAll(
        selected.map((el) => ({
          id: el.id,
          changes: {
            x: Math.round(el.x + snappedDx),
            y: Math.round(el.y + snappedDy),
          },
        })),
      );
    },
  );

  if (selected.length < 2) return null;

  return (
    <div
      ref={boxRef}
      onMouseDown={(e) => handleDrag(e, minX - MULTI_PAD, minY - MULTI_PAD)}
      className="absolute z-[998] border-2 border-primary rounded cursor-move pointer-events-auto"
      style={{
        left: minX - MULTI_PAD,
        top: minY - MULTI_PAD,
        width: maxX - minX + MULTI_PAD * 2,
        height: maxY - minY + MULTI_PAD * 2,
        backgroundColor: "color-mix(in srgb, var(--color-primary) 3%, transparent)", // Subtle tint to show it's a draggable area
      }}
    >
      {/* Top toolbar */}
      <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center bg-white border border-[#eceef0] rounded-full shadow-lg px-3 py-1.5 gap-2 pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in duration-200">
        <span className="text-xs text-slate-400 font-bold">
          {selectedIds.length} phần tử
        </span>
        <div className="w-px h-3 bg-slate-200" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateAll();
          }}
          className="text-slate-600 hover:text-[#070235] transition-colors p-0.5"
          title="Nhân bản tất cả"
        >
          <RiFileCopyLine size={15} />
        </button>
        <div className="w-px h-3 bg-slate-200" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteAll();
          }}
          className="text-slate-600 hover:text-red-500 transition-colors p-0.5"
          title="Xoá tất cả"
        >
          <RiDeleteBin6Line size={15} />
        </button>
      </div>
    </div>
  );
}
