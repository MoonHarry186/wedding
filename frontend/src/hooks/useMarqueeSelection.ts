import { useState, useRef } from "react";
import { useEditorStore } from "@/store/editor.store";

export function useMarqueeSelection(
  canvasContainerRef: React.RefObject<HTMLDivElement | null>,
  zoom: number,
) {
  const { setSelectedElementIds } = useEditorStore();
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const isDraggingMarquee = useRef(false);
  const shouldSuppressNextCanvasClick = useRef(false);

  const handlePageMouseDown = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the page root container
    if ((e.target as HTMLElement).id !== "page-root-container") {
      return;
    }

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    if (!e.shiftKey) {
      setSelectedElementIds(["canvas"]);
    }
    setMarquee({ startX, startY, x: startX, y: startY, width: 0, height: 0 });
    isDraggingMarquee.current = false;

    const onMouseMove = (mv: MouseEvent) => {
      const curX = (mv.clientX - rect.left) / zoom;
      const curY = (mv.clientY - rect.top) / zoom;
      const x = Math.min(startX, curX);
      const y = Math.min(startY, curY);
      const width = Math.abs(curX - startX);
      const height = Math.abs(curY - startY);

      if (width > 2 || height > 2) {
        isDraggingMarquee.current = true;
      }

      setMarquee({ startX, startY, x, y, width, height });

      // Live-highlight intersecting top-level elements (non-children)
      const currentElements = useEditorStore.getState().elements;
      const topLevel = currentElements.filter((el) => !el.groupId);
      const hit = topLevel
        .filter((el) => {
          return (
            el.x < x + width &&
            el.x + el.width > x &&
            el.y < y + height &&
            el.y + el.height > y
          );
        })
        .map((el) => el.id);

      if (mv.shiftKey) {
        const cur = useEditorStore
          .getState()
          .selectedElementIds.filter((id) => id !== "canvas");
        setSelectedElementIds([...new Set([...cur, ...hit])]);
      } else {
        setSelectedElementIds(hit.length > 0 ? hit : ["canvas"]);
      }
    };

    const onMouseUp = () => {
      shouldSuppressNextCanvasClick.current = isDraggingMarquee.current;
      setMarquee(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    marquee,
    handlePageMouseDown,
    shouldSuppressNextCanvasClickRef: shouldSuppressNextCanvasClick,
  };
}
