"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  CanvasData,
  GroupElement as GroupElementType,
  ImageElement as ImageElementType,
  TextElement as TextElementType,
} from "@/types/editor";
import { TextElement } from "@/components/editor/elements/TextElement";
import { ImageElement } from "@/components/editor/elements/ImageElement";
import { GroupElement } from "@/components/editor/elements/GroupElement";
import { WidgetElement } from "@/components/editor/elements/WidgetElement";
import { applyInvitationVariablesToElements } from "@/lib/applyInvitationVariables";

const BASE_CANVAS_WIDTH = 500;

interface ScaledCanvasPreviewRendererProps {
  canvasData: CanvasData;
  variableValues: Record<string, string | number | boolean | Record<string, unknown>>;
  viewportWidth?: number;
}

export function ScaledCanvasPreviewRenderer({
  canvasData,
  variableValues = {},
  viewportWidth,
}: ScaledCanvasPreviewRendererProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [measuredViewportWidth, setMeasuredViewportWidth] =
    useState(BASE_CANVAS_WIDTH);
  const canvasHeight = canvasData.canvasHeight || 1000;

  useLayoutEffect(() => {
    if (viewportWidth) return;

    const node = viewportRef.current;
    if (!node) return;

    const updateWidth = () => {
      setMeasuredViewportWidth(node.clientWidth || BASE_CANVAS_WIDTH);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewportWidth]);

  const resolvedViewportWidth = viewportWidth || measuredViewportWidth;

  const scale = Math.min(1, resolvedViewportWidth / BASE_CANVAS_WIDTH);
  const scaledHeight = canvasHeight * scale;

  const resolvedElements = useMemo(
    () => applyInvitationVariablesToElements(canvasData.elements || [], variableValues),
    [canvasData.elements, variableValues],
  );

  return (
    <div ref={viewportRef} className="w-full">
      <div
        className="relative"
        style={{
          width: `${resolvedViewportWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <div
          className={cn(
            "absolute left-0 top-0 origin-top-left overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.14)]",
          )}
          style={{
            width: `${BASE_CANVAS_WIDTH}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${scale})`,
            backgroundColor: canvasData.backgroundImage
              ? "transparent"
              : resolveBackgroundColor(canvasData.backgroundColor),
            backgroundImage: canvasData.backgroundImage
              ? `url(${canvasData.backgroundImage})`
              : canvasData.backgroundColor?.startsWith("linear-gradient")
                ? canvasData.backgroundColor
                : "none",
            backgroundSize: canvasData.backgroundSize || "cover",
            backgroundRepeat: canvasData.backgroundRepeat || "no-repeat",
            backgroundPosition: canvasData.backgroundPosition || "center",
            backgroundAttachment: canvasData.backgroundAttachment || "scroll",
          }}
        >
          {[...resolvedElements]
            .filter((element) => !element.groupId)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((element) => {
              if (element.type === "text") {
                return (
                  <TextElement
                    key={element.id}
                    element={element as TextElementType}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    pointerEvents="none"
                    isReadOnly
                  />
                );
              }

              if (element.type === "image") {
                return (
                  <ImageElement
                    key={element.id}
                    element={element as ImageElementType}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    pointerEvents="none"
                    isReadOnly
                  />
                );
              }

              if (element.type === "group") {
                return (
                  <GroupElement
                    key={element.id}
                    element={element as GroupElementType}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                    pointerEvents="none"
                    isReadOnly
                    overrideElements={resolvedElements}
                  />
                );
              }

              if (element.type === "widget") {
                return (
                  <WidgetElement
                    key={element.id}
                    element={element}
                    isSelected={false}
                    onSelect={() => {}}
                    onUpdate={() => {}}
                  />
                );
              }

              return null;
            })}
        </div>
      </div>
    </div>
  );
}

function resolveBackgroundColor(color?: string) {
  if (!color || color.startsWith("linear-gradient")) return "#ffffff";
  return color;
}
