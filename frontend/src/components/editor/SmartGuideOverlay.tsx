"use client";

import React from "react";
import { useSmartGuidesState } from "@/hooks/useSmartGuides";

export function SmartGuideOverlay() {
  const { active, guides, spacingGuides } = useSmartGuidesState();

  if (!active || (guides.length === 0 && spacingGuides.length === 0)) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[1200]">
      {guides.map((guide) => {
        const isVertical = guide.orientation === "vertical";

        return (
          <div
            key={guide.id}
            className="absolute bg-sky-500/95 shadow-[0_0_8px_rgba(14,165,233,0.45)] transition-opacity duration-75"
            style={
              isVertical
                ? {
                    left: guide.x1,
                    top: guide.y1,
                    width: 1,
                    height: Math.max(1, guide.y2 - guide.y1),
                  }
                : {
                    left: guide.x1,
                    top: guide.y1,
                    width: Math.max(1, guide.x2 - guide.x1),
                    height: 1,
                  }
            }
          />
        );
      })}

      {spacingGuides.map((guide) => {
        const isVertical = guide.orientation === "vertical";

        return (
          <React.Fragment key={guide.id}>
            <div
              className="absolute bg-rose-500/95 shadow-[0_0_6px_rgba(244,63,94,0.28)] transition-opacity duration-75"
              style={
                isVertical
                  ? {
                      left: guide.x1,
                      top: guide.y1,
                      width: 1,
                      height: Math.max(1, guide.y2 - guide.y1),
                    }
                  : {
                      left: guide.x1,
                      top: guide.y1,
                      width: Math.max(1, guide.x2 - guide.x1),
                      height: 1,
                    }
              }
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm"
              style={{
                left: guide.labelX,
                top: guide.labelY,
              }}
            >
              {guide.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
