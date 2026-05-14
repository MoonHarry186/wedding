import type { CSSProperties } from "react";
import {
  ANIMATION_TYPE_MAP,
  EASING_MAP,
  LOOP_TYPE_MAP,
} from "@/constants/editor";
import type { BaseElement } from "@/types/editor";

type AnimatableElement = Pick<BaseElement, "animation" | "loopAnimation">;

export function getElementAnimationStyle(
  element: AnimatableElement,
  isVisible: boolean,
): CSSProperties {
  const style: CSSProperties = {};

  if (!isVisible) {
    style.opacity = 0;
    return style;
  }

  const entrance = element.animation;
  const loop = element.loopAnimation;
  const isEntranceEnabled = entrance?.enabled && entrance.type !== "Không có";
  const isLoopEnabled = loop?.enabled && loop.type !== "Không có";

  if (isEntranceEnabled) {
    const name = ANIMATION_TYPE_MAP[entrance.type] || "fadeIn";
    const duration = entrance.duration || 1.6;
    const delay = entrance.delay || 0;
    const easing = EASING_MAP[entrance.easing] || "ease-out";
    const entranceStr = `${name} ${duration}s ${easing} ${delay}s both`;

    if (isLoopEnabled) {
      const loopName = LOOP_TYPE_MAP[loop.type] || "wiggle";
      const loopDuration = loop.duration || 2.0;
      const loopDelay = loop.delay || 0;
      const loopEasing = loop.easing === "Ease Out" ? "ease-out" : "linear";
      const totalStartDelay = duration + delay + loopDelay;

      style.animation = `${entranceStr}, ${loopName} ${loopDuration}s ${loopEasing} ${totalStartDelay}s infinite`;
    } else {
      style.animation = entranceStr;
    }

    style.willChange = "transform, opacity";
  } else if (isLoopEnabled) {
    const loopName = LOOP_TYPE_MAP[loop.type] || "wiggle";
    const loopDuration = loop.duration || 2.0;
    const loopDelay = loop.delay || 0;
    const loopEasing = loop.easing === "Ease Out" ? "ease-out" : "linear";

    style.animation = `${loopName} ${loopDuration}s ${loopEasing} ${loopDelay}s infinite`;
    style.willChange = "transform";
  }

  return style;
}
