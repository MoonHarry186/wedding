import { detectAlignmentCandidates } from "./alignmentDetection";
import {
  calculateEqualSpacingSnap,
  calculateSpacingGuides,
} from "./spacingCalculation";
import type { Rect, SnapResult } from "./types";

export const SMART_GUIDE_SNAP_THRESHOLD = 5;
export const EDITOR_CANVAS_WIDTH = 500;

export function runSnapEngine(
  rect: Rect,
  otherRects: Rect[],
  canvas: { width: number; height: number },
  threshold: number = SMART_GUIDE_SNAP_THRESHOLD,
): SnapResult {
  const { verticalCandidates, horizontalCandidates } = detectAlignmentCandidates(
    rect,
    otherRects,
    canvas,
    threshold,
  );

  const xDelta = verticalCandidates[0]?.delta ?? 0;
  const yDelta = horizontalCandidates[0]?.delta ?? 0;
  const snappedRect: Rect = {
    ...rect,
    x: rect.x + xDelta,
    y: rect.y + yDelta,
  };
  const equalSpacing = calculateEqualSpacingSnap(snappedRect, otherRects, threshold);
  const finalRect: Rect = {
    ...snappedRect,
    x: equalSpacing.x ?? snappedRect.x,
    y: equalSpacing.y ?? snappedRect.y,
  };

  return {
    x: finalRect.x,
    y: finalRect.y,
    guides: [
      ...verticalCandidates.map((candidate) => candidate.guide),
      ...horizontalCandidates.map((candidate) => candidate.guide),
      ...equalSpacing.axisGuides,
    ],
    spacingGuides: [
      ...calculateSpacingGuides(finalRect, otherRects, threshold),
      ...equalSpacing.guides,
    ],
  };
}
