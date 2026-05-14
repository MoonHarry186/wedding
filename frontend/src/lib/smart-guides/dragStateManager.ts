import { runSnapEngine } from "./snapEngine";
import type { Rect, SmartGuideOverlayState } from "./types";

type Subscriber = (state: SmartGuideOverlayState) => void;

const EMPTY_STATE: SmartGuideOverlayState = {
  active: false,
  guides: [],
  spacingGuides: [],
};

class DragStateManager {
  private subscribers = new Set<Subscriber>();
  private state: SmartGuideOverlayState = EMPTY_STATE;
  private rafId: number | null = null;
  private session: {
    otherRects: Rect[];
    canvas: { width: number; height: number };
  } | null = null;

  subscribe(subscriber: Subscriber) {
    this.subscribers.add(subscriber);
    subscriber(this.state);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  startSession(payload: {
    otherRects: Rect[];
    canvas: { width: number; height: number };
  }) {
    this.session = payload;
  }

  compute(
    rect: Rect,
    otherRects?: Rect[],
    canvas?: { width: number; height: number },
  ) {
    const resolvedOtherRects = otherRects ?? this.session?.otherRects ?? [];
    const resolvedCanvas = canvas ?? this.session?.canvas;

    if (!resolvedCanvas) {
      return {
        x: rect.x,
        y: rect.y,
        guides: [],
        spacingGuides: [],
      };
    }

    const result = runSnapEngine(rect, resolvedOtherRects, resolvedCanvas);
    this.scheduleState({
      active: true,
      guides: result.guides,
      spacingGuides: result.spacingGuides,
    });
    return result;
  }

  clear() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.session = null;
    this.state = EMPTY_STATE;
    this.publish();
  }

  private scheduleState(nextState: SmartGuideOverlayState) {
    this.state = nextState;

    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.publish();
    });
  }

  private publish() {
    for (const subscriber of this.subscribers) {
      subscriber(this.state);
    }
  }
}

export const dragStateManager = new DragStateManager();
