import { useRef, useCallback, useLayoutEffect } from "react";

export function useDrag(
  onDragMove: (x: number, y: number, dx: number, dy: number) => void,
  zoom: number = 1,
  onDragStart?: () => void,
  onDragEnd?: (x: number, y: number, dx: number, dy: number) => void,
) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    currentX: number;
    currentY: number;
    dx: number;
    dy: number;
  } | null>(null);

  const onDragMoveRef = useRef(onDragMove);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const zoomRef = useRef(zoom);

  // Update refs on every render safely using useLayoutEffect
  useLayoutEffect(() => {
    onDragMoveRef.current = onDragMove;
    onDragStartRef.current = onDragStart;
    onDragEndRef.current = onDragEnd;
    zoomRef.current = zoom;
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, currentX: number, currentY: number) => {
      e.preventDefault();
      e.stopPropagation();

      let hasStartedDrag = false;

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: currentX,
        origY: currentY,
        currentX: currentX,
        currentY: currentY,
        dx: 0,
        dy: 0,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = (moveEvent.clientX - dragRef.current.startX) / zoomRef.current;
        const dy = (moveEvent.clientY - dragRef.current.startY) / zoomRef.current;

        // Only trigger onDragStart when there's actual movement (e.g. > 3px)
        if (!hasStartedDrag && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          hasStartedDrag = true;
          onDragStartRef.current?.();
        }

        if (!hasStartedDrag) return;
        
        dragRef.current.currentX = dragRef.current.origX + dx;
        dragRef.current.currentY = dragRef.current.origY + dy;
        dragRef.current.dx = dx;
        dragRef.current.dy = dy;

        onDragMoveRef.current(dragRef.current.currentX, dragRef.current.currentY, dx, dy);
      };

      const handleMouseUp = () => {
        if (dragRef.current && hasStartedDrag) {
          onDragEndRef.current?.(
            dragRef.current.currentX,
            dragRef.current.currentY,
            dragRef.current.dx,
            dragRef.current.dy
          );
        }
        dragRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [], // Now handleMouseDown is completely stable
  );

  return handleMouseDown;
}

