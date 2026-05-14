import React from "react";
import { cn } from "@/lib/utils";

export function ResizeHandle({
  type,
  onResizeStart,
}: {
  type: string;
  onResizeStart: (e: React.MouseEvent, type: string) => void;
}) {
  const isCorner = type.includes("-");

  const getCursor = () => {
    if (type === "top-left" || type === "bottom-right") return "nwse-resize";
    if (type === "top-right" || type === "bottom-left") return "nesw-resize";
    if (type === "top" || type === "bottom") return "ns-resize";
    if (type === "left" || type === "right") return "ew-resize";
    return "pointer";
  };

  const getPosition = () => {
    switch (type) {
      case "top-left":
        return "-translate-x-1/2 -translate-y-1/2 top-0 left-0";
      case "top-right":
        return "translate-x-1/2 -translate-y-1/2 top-0 right-0";
      case "bottom-left":
        return "-translate-x-1/2 translate-y-1/2 bottom-0 left-0";
      case "bottom-right":
        return "translate-x-1/2 translate-y-1/2 bottom-0 right-0";
      case "top":
        return "left-1/2 -translate-x-1/2 -translate-y-1/2 top-0";
      case "bottom":
        return "left-1/2 -translate-x-1/2 translate-y-1/2 bottom-0";
      case "left":
        return "top-1/2 -translate-y-1/2 -translate-x-1/2 left-0";
      case "right":
        return "top-1/2 -translate-y-1/2 translate-x-1/2 right-0";
      default:
        return "";
    }
  };

  return (
    <div
      onMouseDown={(e) => onResizeStart(e, type)}
      className={cn(
        "absolute bg-white border-2 border-primary shadow-sm pointer-events-auto z-[1001] transition-all",
        isCorner
          ? "w-3 h-3 rounded-full hover:scale-125"
          : type === "top" || type === "bottom"
            ? "w-4 h-1.5 rounded-sm hover:scale-x-125"
            : "w-1.5 h-4 rounded-sm hover:scale-y-125",
        getPosition(),
      )}
      style={{ cursor: getCursor() }}
    />
  );
}
