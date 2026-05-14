import type { AxisGuide, Rect, SpacingGuide } from "./types";

function overlapsVertically(a: Rect, b: Rect) {
  return a.y < b.y + b.height && a.y + a.height > b.y;
}

function overlapsHorizontally(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

function createHorizontalSpacingGuide(
  id: string,
  x1: number,
  x2: number,
  y: number,
): SpacingGuide {
  const distance = Math.round(Math.abs(x2 - x1));
  return {
    id,
    orientation: "horizontal",
    x1,
    x2,
    y1: y,
    y2: y,
    label: `${distance}px`,
    labelX: (x1 + x2) / 2,
    labelY: y - 10,
  };
}

function createVerticalSpacingGuide(
  id: string,
  y1: number,
  y2: number,
  x: number,
): SpacingGuide {
  const distance = Math.round(Math.abs(y2 - y1));
  return {
    id,
    orientation: "vertical",
    x1: x,
    x2: x,
    y1,
    y2,
    label: `${distance}px`,
    labelX: x + 10,
    labelY: (y1 + y2) / 2,
  };
}

export function calculateSpacingGuides(rect: Rect, otherRects: Rect[], threshold: number) {
  const guides: SpacingGuide[] = [];

  const horizontalNeighbors = otherRects
    .filter((other) => overlapsVertically(rect, other))
    .sort((a, b) => a.x - b.x);

  const leftNeighbor = [...horizontalNeighbors]
    .filter((other) => other.x + other.width <= rect.x)
    .pop();
  const rightNeighbor = horizontalNeighbors.find(
    (other) => other.x >= rect.x + rect.width,
  );

  if (leftNeighbor) {
    const gap = rect.x - (leftNeighbor.x + leftNeighbor.width);
    if (gap > 0) {
      guides.push(
        createHorizontalSpacingGuide(
          `spacing-left-${leftNeighbor.id}`,
          leftNeighbor.x + leftNeighbor.width,
          rect.x,
          Math.max(leftNeighbor.y, rect.y) + Math.min(leftNeighbor.height, rect.height) / 2,
        ),
      );
    }
  }

  if (rightNeighbor) {
    const gap = rightNeighbor.x - (rect.x + rect.width);
    if (gap > 0) {
      guides.push(
        createHorizontalSpacingGuide(
          `spacing-right-${rightNeighbor.id}`,
          rect.x + rect.width,
          rightNeighbor.x,
          Math.max(rightNeighbor.y, rect.y) + Math.min(rightNeighbor.height, rect.height) / 2,
        ),
      );
    }
  }

  if (leftNeighbor && rightNeighbor) {
    const leftGap = rect.x - (leftNeighbor.x + leftNeighbor.width);
    const rightGap = rightNeighbor.x - (rect.x + rect.width);
    if (leftGap > 0 && rightGap > 0 && Math.abs(leftGap - rightGap) <= threshold) {
      const y =
        Math.max(leftNeighbor.y, rect.y, rightNeighbor.y) +
        Math.min(leftNeighbor.height, rect.height, rightNeighbor.height) / 2;
      guides.push(
        createHorizontalSpacingGuide(
          `spacing-equal-left-${leftNeighbor.id}`,
          leftNeighbor.x + leftNeighbor.width,
          rect.x,
          y,
        ),
        createHorizontalSpacingGuide(
          `spacing-equal-right-${rightNeighbor.id}`,
          rect.x + rect.width,
          rightNeighbor.x,
          y,
        ),
      );
    }
  }

  const verticalNeighbors = otherRects
    .filter((other) => overlapsHorizontally(rect, other))
    .sort((a, b) => a.y - b.y);

  const topNeighbor = [...verticalNeighbors]
    .filter((other) => other.y + other.height <= rect.y)
    .pop();
  const bottomNeighbor = verticalNeighbors.find(
    (other) => other.y >= rect.y + rect.height,
  );

  if (topNeighbor) {
    const gap = rect.y - (topNeighbor.y + topNeighbor.height);
    if (gap > 0) {
      guides.push(
        createVerticalSpacingGuide(
          `spacing-top-${topNeighbor.id}`,
          topNeighbor.y + topNeighbor.height,
          rect.y,
          Math.max(topNeighbor.x, rect.x) + Math.min(topNeighbor.width, rect.width) / 2,
        ),
      );
    }
  }

  if (bottomNeighbor) {
    const gap = bottomNeighbor.y - (rect.y + rect.height);
    if (gap > 0) {
      guides.push(
        createVerticalSpacingGuide(
          `spacing-bottom-${bottomNeighbor.id}`,
          rect.y + rect.height,
          bottomNeighbor.y,
          Math.max(bottomNeighbor.x, rect.x) + Math.min(bottomNeighbor.width, rect.width) / 2,
        ),
      );
    }
  }

  if (topNeighbor && bottomNeighbor) {
    const topGap = rect.y - (topNeighbor.y + topNeighbor.height);
    const bottomGap = bottomNeighbor.y - (rect.y + rect.height);
    if (topGap > 0 && bottomGap > 0 && Math.abs(topGap - bottomGap) <= threshold) {
      const x =
        Math.max(topNeighbor.x, rect.x, bottomNeighbor.x) +
        Math.min(topNeighbor.width, rect.width, bottomNeighbor.width) / 2;
      guides.push(
        createVerticalSpacingGuide(
          `spacing-equal-top-${topNeighbor.id}`,
          topNeighbor.y + topNeighbor.height,
          rect.y,
          x,
        ),
        createVerticalSpacingGuide(
          `spacing-equal-bottom-${bottomNeighbor.id}`,
          rect.y + rect.height,
          bottomNeighbor.y,
          x,
        ),
      );
    }
  }

  return guides;
}

type EqualSpacingSnap = {
  x?: number;
  y?: number;
  guides: SpacingGuide[];
  axisGuides: AxisGuide[];
};

function makeAxisGuideFromSpacing(
  id: string,
  orientation: "vertical" | "horizontal",
  position: number,
  start: number,
  end: number,
): AxisGuide {
  return orientation === "vertical"
    ? {
        id,
        orientation,
        x1: position,
        x2: position,
        y1: start,
        y2: end,
        kind: "alignment",
      }
    : {
        id,
        orientation,
        x1: start,
        x2: end,
        y1: position,
        y2: position,
        kind: "alignment",
      };
}

export function calculateEqualSpacingSnap(
  rect: Rect,
  otherRects: Rect[],
  threshold: number,
): EqualSpacingSnap {
  const result: EqualSpacingSnap = {
    guides: [],
    axisGuides: [],
  };

  const horizontal = otherRects
    .filter((other) => overlapsVertically(rect, other))
    .sort((a, b) => a.x - b.x);

  for (let i = 0; i < horizontal.length - 2; i += 1) {
    const a = horizontal[i];
    const b = horizontal[i + 1];
    const c = horizontal[i + 2];
    const gapAB = b.x - (a.x + a.width);
    const gapBC = c.x - (b.x + b.width);

    if (gapAB <= 0 || gapBC <= 0 || Math.abs(gapAB - gapBC) > threshold) continue;

    const leftTargetX = b.x + b.width + gapAB;
    const leftDelta = leftTargetX - rect.x;
    if (Math.abs(leftDelta) <= threshold) {
      result.x = leftTargetX;
      const y =
        Math.max(a.y, b.y, c.y, rect.y) +
        Math.min(a.height, b.height, c.height, rect.height) / 2;
      result.guides.push(
        createHorizontalSpacingGuide(`equal-chain-h-1-${a.id}-${b.id}`, a.x + a.width, b.x, y),
        createHorizontalSpacingGuide(`equal-chain-h-2-${b.id}-${c.id}`, b.x + b.width, c.x, y),
        createHorizontalSpacingGuide(`equal-chain-h-3-${b.id}-${rect.id}`, b.x + b.width, rect.x, y),
      );
      result.axisGuides.push(
        makeAxisGuideFromSpacing(
          `equal-chain-v-${rect.id}`,
          "vertical",
          rect.x,
          Math.min(a.y, b.y, c.y, rect.y),
          Math.max(a.y + a.height, b.y + b.height, c.y + c.height, rect.y + rect.height),
        ),
      );
      break;
    }

    const betweenTargetX = a.x + a.width + gapAB;
    const centeredBetweenBAndC = c.x - gapAB - rect.width;
    const betweenDelta = centeredBetweenBAndC - rect.x;
    if (Math.abs(betweenTargetX - b.x) <= threshold && Math.abs(betweenDelta) <= threshold) {
      result.x = centeredBetweenBAndC;
      const y =
        Math.max(a.y, b.y, c.y, rect.y) +
        Math.min(a.height, b.height, c.height, rect.height) / 2;
      result.guides.push(
        createHorizontalSpacingGuide(`equal-chain-h-4-${a.id}-${b.id}`, a.x + a.width, b.x, y),
        createHorizontalSpacingGuide(
          `equal-chain-h-5-${rect.id}-${c.id}`,
          rect.x + rect.width,
          c.x,
          y,
        ),
      );
      break;
    }
  }

  const vertical = otherRects
    .filter((other) => overlapsHorizontally(rect, other))
    .sort((a, b) => a.y - b.y);

  for (let i = 0; i < vertical.length - 2; i += 1) {
    const a = vertical[i];
    const b = vertical[i + 1];
    const c = vertical[i + 2];
    const gapAB = b.y - (a.y + a.height);
    const gapBC = c.y - (b.y + b.height);

    if (gapAB <= 0 || gapBC <= 0 || Math.abs(gapAB - gapBC) > threshold) continue;

    const targetY = b.y + b.height + gapAB;
    const delta = targetY - rect.y;
    if (Math.abs(delta) <= threshold) {
      result.y = targetY;
      const x =
        Math.max(a.x, b.x, c.x, rect.x) +
        Math.min(a.width, b.width, c.width, rect.width) / 2;
      result.guides.push(
        createVerticalSpacingGuide(`equal-chain-v-1-${a.id}-${b.id}`, a.y + a.height, b.y, x),
        createVerticalSpacingGuide(`equal-chain-v-2-${b.id}-${c.id}`, b.y + b.height, c.y, x),
        createVerticalSpacingGuide(`equal-chain-v-3-${b.id}-${rect.id}`, b.y + b.height, rect.y, x),
      );
      result.axisGuides.push(
        makeAxisGuideFromSpacing(
          `equal-chain-h-${rect.id}`,
          "horizontal",
          rect.y,
          Math.min(a.x, b.x, c.x, rect.x),
          Math.max(a.x + a.width, b.x + b.width, c.x + c.width, rect.x + rect.width),
        ),
      );
      break;
    }
  }

  return result;
}
