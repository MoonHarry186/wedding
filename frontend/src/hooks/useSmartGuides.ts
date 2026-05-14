import React from "react";
import { useEditorStore } from "@/store/editor.store";
import { dragStateManager } from "@/lib/smart-guides/dragStateManager";
import {
  EDITOR_CANVAS_WIDTH,
  SMART_GUIDE_SNAP_THRESHOLD,
} from "@/lib/smart-guides/snapEngine";
import type {
  CanvasElement,
} from "@/types/editor";
import type { Rect, SmartGuideOverlayState } from "@/lib/smart-guides/types";

function getAbsoluteRects(
  elements: CanvasElement[],
  excludedIds: string[],
): Rect[] {
  const excluded = new Set(excludedIds);

  return elements
    .filter((element) => !element.groupId && !excluded.has(element.id))
    .map((element) => ({
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    }));
}

export function useSmartGuidesState() {
  const [state, setState] = React.useState<SmartGuideOverlayState>({
    active: false,
    guides: [],
    spacingGuides: [],
  });

  React.useEffect(() => dragStateManager.subscribe(setState), []);

  return state;
}

type DragRectPayload = {
  activeId: string;
  selectedIds?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useSmartGuideDrag() {
  const beginDrag = React.useCallback((selectedIds: string[]) => {
    const state = useEditorStore.getState();
    if (!state.smartGuidesEnabled) return;

    dragStateManager.startSession({
      otherRects: getAbsoluteRects(state.elements, selectedIds),
      canvas: {
        width: EDITOR_CANVAS_WIDTH,
        height: state.canvasHeight,
      },
    });
  }, []);

  const snapPosition = React.useCallback(
    ({ activeId, x, y, width, height }: DragRectPayload) => {
      const state = useEditorStore.getState();
      if (!state.smartGuidesEnabled) {
        return { x, y, guides: [], spacingGuides: [] };
      }
      const rect: Rect = { id: activeId, x, y, width, height };

      return dragStateManager.compute(rect);
    },
    [],
  );

  const clearGuides = React.useCallback(() => {
    dragStateManager.clear();
  }, []);

  return {
    beginDrag,
    snapPosition,
    clearGuides,
    threshold: SMART_GUIDE_SNAP_THRESHOLD,
  };
}
