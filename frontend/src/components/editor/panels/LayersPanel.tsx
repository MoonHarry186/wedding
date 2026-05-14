import React, { useState } from "react";
import {
  RiStackLine,
  RiText,
  RiImageLine,
  RiLockLine,
  RiLockUnlockLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiEyeOffLine,
  RiDraggable,
  RiGroupLine,
} from "@remixicon/react";
import { Button, Empty } from "antd";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";
import { CanvasElement } from "@/types/editor";

export function LayersPanel() {
  const {
    elements,
    selectedElementIds,
    setSelectedElementIds,
    toggleLock,
    deleteElement,
    updateZIndexes,
  } = useEditorStore();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Sort elements by zIndex descending (top layer first)
  const sortedElements = [...elements].sort(
    (a, b) => (b.zIndex || 0) - (a.zIndex || 0),
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";

    // Create a ghost image or just let browser handle it
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const ghost = e.currentTarget as HTMLElement;
    ghost.style.opacity = "1";
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;

    const currentIds = sortedElements.map((el) => el.id);
    const sourceIndex = currentIds.indexOf(sourceId);
    const targetIndex = currentIds.indexOf(targetId);

    const newIds = [...currentIds];
    newIds.splice(sourceIndex, 1);
    newIds.splice(targetIndex, 0, sourceId);

    updateZIndexes(newIds);
    setDraggedId(null);
  };

  if (elements.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 opacity-50">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-xs font-medium text-slate-500">
              Chưa có lớp nào
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RiStackLine size={18} className="text-[#070235]" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
            Quản lý lớp
          </h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {elements.length} lớp
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {sortedElements
          .filter((el) => !el.groupId) // Only top-level in main list
          .map((element) => (
            <LayerItem
              key={element.id}
              element={element}
              level={0}
              selectedElementIds={selectedElementIds}
              setSelectedElementIds={setSelectedElementIds}
              toggleLock={toggleLock}
              deleteElement={deleteElement}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              draggedId={draggedId}
              elements={elements}
            />
          ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic text-center">
          Mẹo: Nắm biểu tượng bên trái để kéo đổi thứ tự lớp
        </p>
      </div>
    </div>
  );
}

function LayerItem({
  element,
  level,
  selectedElementIds,
  setSelectedElementIds,
  toggleLock,
  deleteElement,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  draggedId,
  elements,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const isSelected = selectedElementIds.includes(element.id);
  const isGroup = element.type === "group";

  const children = isGroup
    ? (element.childIds as string[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((id) => elements.find((el: any) => el.id === id))
        .filter(Boolean)
        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
    : [];

  return (
    <>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, element.id)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, element.id)}
        onClick={() => {
          setSelectedElementIds([element.id]);
          const el = document.getElementById(`element-${element.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
        className={cn(
          "group flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer relative mb-1",
          isSelected
            ? "bg-slate-50 border-primary/20 ring-1 ring-primary/10"
            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-100",
          draggedId === element.id && "opacity-40 grayscale scale-95",
        )}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="text-slate-300 group-hover:text-slate-400 shrink-0">
          <RiDraggable size={14} />
        </div>

        <div
          className={cn(
            "w-8 h-8 rounded flex items-center justify-center shrink-0",
            element.type === "text"
              ? "bg-primary/5 text-primary"
              : element.type === "image"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600",
          )}
        >
          {element.type === "text" ? (
            <RiText size={16} />
          ) : element.type === "image" ? (
            <RiImageLine size={16} />
          ) : (
            <RiGroupLine size={16} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">
            {element.type === "text"
              ? element.content
              : element.type === "image"
                ? "Hình ảnh"
                : "Nhóm phần tử"}
          </p>
          <p className="text-[9px] text-slate-400 font-medium capitalize">
            {element.type === "text"
              ? "Lớp văn bản"
              : element.type === "image"
                ? "Lớp hình ảnh"
                : `${element.childIds?.length || 0} thành phần`}
          </p>
        </div>

        {!element.groupId && (
          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(element.id);
              }}
              className={cn(
                "p-1 rounded hover:bg-slate-200 transition-colors",
                element.isLocked ? "text-amber-500" : "text-slate-400",
              )}
            >
              {element.isLocked ? (
                <RiLockLine size={14} />
              ) : (
                <RiLockUnlockLine size={14} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <RiDeleteBin6Line size={14} />
            </button>
          </div>
        )}
      </div>

      {isGroup &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children.map((child: any) => (
          <LayerItem
            key={child.id}
            element={child}
            level={level + 1}
            selectedElementIds={selectedElementIds}
            setSelectedElementIds={setSelectedElementIds}
            toggleLock={toggleLock}
            deleteElement={deleteElement}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            draggedId={draggedId}
            elements={elements}
          />
        ))}
    </>
  );
}

