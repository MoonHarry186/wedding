import type { AxisGuide, Rect, SnapAxisCandidate } from "./types";

const EPSILON = 0.001;

type AnchorName = "left" | "centerX" | "right" | "top" | "centerY" | "bottom";

function getVerticalAnchors(rect: Rect) {
  return [
    { name: "left" as const, value: rect.x },
    { name: "centerX" as const, value: rect.x + rect.width / 2 },
    { name: "right" as const, value: rect.x + rect.width },
  ];
}

function getHorizontalAnchors(rect: Rect) {
  return [
    { name: "top" as const, value: rect.y },
    { name: "centerY" as const, value: rect.y + rect.height / 2 },
    { name: "bottom" as const, value: rect.y + rect.height },
  ];
}

function getVerticalShift(anchor: AnchorName, delta: number) {
  if (anchor === "left") return delta;
  if (anchor === "centerX") return delta;
  return delta;
}

function getHorizontalShift(anchor: AnchorName, delta: number) {
  if (anchor === "top") return delta;
  if (anchor === "centerY") return delta;
  return delta;
}

function createVerticalGuide(
  id: string,
  x: number,
  rectA: Rect,
  rectB: Rect,
  kind: AxisGuide["kind"] = "alignment",
): AxisGuide {
  return {
    id,
    orientation: "vertical",
    x1: x,
    x2: x,
    y1: Math.min(rectA.y, rectB.y),
    y2: Math.max(rectA.y + rectA.height, rectB.y + rectB.height),
    kind,
  };
}

function createHorizontalGuide(
  id: string,
  y: number,
  rectA: Rect,
  rectB: Rect,
  kind: AxisGuide["kind"] = "alignment",
): AxisGuide {
  return {
    id,
    orientation: "horizontal",
    x1: Math.min(rectA.x, rectB.x),
    x2: Math.max(rectA.x + rectA.width, rectB.x + rectB.width),
    y1: y,
    y2: y,
    kind,
  };
}

function keepBestCandidates(candidates: SnapAxisCandidate[]) {
  if (candidates.length === 0) return [];

  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.delta) - Math.abs(b.delta),
  );
  const best = Math.abs(sorted[0].delta);

  return sorted.filter((candidate) => Math.abs(Math.abs(candidate.delta) - best) < EPSILON);
}

export function detectAlignmentCandidates(
  rect: Rect,
  otherRects: Rect[],
  canvas: { width: number; height: number },
  threshold: number,
) {
  const verticalCandidates: SnapAxisCandidate[] = [];
  const horizontalCandidates: SnapAxisCandidate[] = [];

  const rectVerticalAnchors = getVerticalAnchors(rect);
  const rectHorizontalAnchors = getHorizontalAnchors(rect);

  for (const other of otherRects) {
    const otherVerticalAnchors = getVerticalAnchors(other);
    const otherHorizontalAnchors = getHorizontalAnchors(other);

    for (const source of rectVerticalAnchors) {
      for (const target of otherVerticalAnchors) {
        const delta = target.value - source.value;
        if (Math.abs(delta) > threshold) continue;

        verticalCandidates.push({
          delta: getVerticalShift(source.name, delta),
          guide: createVerticalGuide(
            `${rect.id}-${other.id}-${source.name}-${target.name}`,
            target.value,
            rect,
            other,
          ),
        });
      }
    }

    for (const source of rectHorizontalAnchors) {
      for (const target of otherHorizontalAnchors) {
        const delta = target.value - source.value;
        if (Math.abs(delta) > threshold) continue;

        horizontalCandidates.push({
          delta: getHorizontalShift(source.name, delta),
          guide: createHorizontalGuide(
            `${rect.id}-${other.id}-${source.name}-${target.name}`,
            target.value,
            rect,
            other,
          ),
        });
      }
    }
  }

  const canvasRect: Rect = {
    id: "canvas",
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  };

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const canvasVerticalTargets = [0, centerX, canvas.width];
  const canvasHorizontalTargets = [0, centerY, canvas.height];

  for (const source of rectVerticalAnchors) {
    for (const target of canvasVerticalTargets) {
      const delta = target - source.value;
      if (Math.abs(delta) <= threshold) {
        verticalCandidates.push({
          delta,
          guide: createVerticalGuide(
            `canvas-x-${source.name}-${target}`,
            target,
            rect,
            canvasRect,
            target === centerX ? "center" : "alignment",
          ),
        });
      }
    }
  }

  for (const source of rectHorizontalAnchors) {
    for (const target of canvasHorizontalTargets) {
      const delta = target - source.value;
      if (Math.abs(delta) <= threshold) {
        horizontalCandidates.push({
          delta,
          guide: createHorizontalGuide(
            `canvas-y-${source.name}-${target}`,
            target,
            rect,
            canvasRect,
            target === centerY ? "center" : "alignment",
          ),
        });
      }
    }
  }

  return {
    verticalCandidates: keepBestCandidates(verticalCandidates),
    horizontalCandidates: keepBestCandidates(horizontalCandidates),
  };
}
