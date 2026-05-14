import { useRef, useCallback } from 'react';

export function useRotate(
  onRotate: (angle: number) => void,
  centerX: number,
  centerY: number,
  initialAngle: number = 0,
) {
  const rotateRef = useRef<{
    startAngle: number;
    baseAngle: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Calculate the angle between the mouse and the center of the element
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      
      const dx = startX - centerX;
      const dy = startY - centerY;
      const startAngle = Math.atan2(dy, dx);

      rotateRef.current = {
        startAngle,
        baseAngle: initialAngle,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!rotateRef.current) return;

        const currentDx = moveEvent.clientX - centerX;
        const currentDy = moveEvent.clientY - centerY;
        const currentAngle = Math.atan2(currentDy, currentDx);

        const deltaAngle = (currentAngle - rotateRef.current.startAngle) * (180 / Math.PI);
        let newAngle = (rotateRef.current.baseAngle + deltaAngle) % 360;
        
        // Snap to 15 degree increments if shift is held (optional)
        if (moveEvent.shiftKey) {
          newAngle = Math.round(newAngle / 15) * 15;
        }

        onRotate(newAngle);
      };

      const handleMouseUp = () => {
        rotateRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [centerX, centerY, initialAngle, onRotate],
  );

  return handleMouseDown;
}
