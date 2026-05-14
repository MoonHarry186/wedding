"use client";

import React from "react";
import { Segmented } from "antd";
import { cn } from "@/lib/utils";

type EditorSegmentedPanelItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  items: EditorSegmentedPanelItem[];
  stickyHeader?: boolean;
  className?: string;
  contentClassName?: string;
};

export function EditorSegmentedPanel({
  value,
  onChange,
  items,
  stickyHeader = false,
  className,
  contentClassName,
}: Props) {
  const activeItem = items.find((item) => item.key === value) ?? items[0];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div
        className={cn(
          "px-2 py-3 bg-white border-b border-slate-100/50 z-10",
          stickyHeader && "sticky top-0",
        )}
      >
        <Segmented
          block
          className="editor-pill-segmented"
          value={activeItem.key}
          onChange={(nextValue) => onChange(nextValue as string)}
          options={items.map((item) => ({
            value: item.key,
            label: (
              <div className="flex items-center justify-center gap-2 py-1">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
            ),
          }))}
        />
      </div>

      <div className={cn("flex-1 overflow-y-auto custom-scrollbar", contentClassName)}>
        {activeItem.content}
      </div>
    </div>
  );
}
