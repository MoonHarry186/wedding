"use client";

import React from "react";
import { App, Button } from "antd";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiImageLine,
  RiMagicLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import type { AnimationSettings, CanvasElement } from "@/types/editor";

type EffectsView = "overview" | "motion";

type MotionPresetId =
  | "none"
  | "fadeInAll"
  | "slideUpAll"
  | "scaleInAll"
  | "flipInAll"
  | "slideUpMix"
  | "fadeInMix";

type MotionPreset = {
  id: MotionPresetId;
  title: string;
  icon: React.ReactNode;
};

const MOTION_PRESETS: MotionPreset[] = [
  {
    id: "none",
    title: "None",
    icon: (
      <div className="relative h-10 w-10 rounded-full border-2 border-slate-400">
        <span className="absolute inset-1 rounded-full border border-slate-300" />
        <span className="absolute left-1/2 top-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-slate-500" />
      </div>
    ),
  },
  {
    id: "fadeInAll",
    title: "Fade In All",
    icon: (
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-[3px] border border-primary/40"
            style={{
              opacity: (index + 3) / 14,
              backgroundColor:
                index > 5 ? "var(--color-primary-fixed)" : "transparent",
            }}
          />
        ))}
      </div>
    ),
  },
  {
    id: "slideUpAll",
    title: "Slide Up All",
    icon: (
      <div className="relative h-10 w-10 rounded-xl border-2 border-primary/70">
        <span className="absolute bottom-1 left-1/2 h-3 w-5 -translate-x-1/2 rounded-md bg-[var(--color-primary-fixed-dim)]" />
        <span className="absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 bg-primary" />
        <span className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-primary" />
      </div>
    ),
  },
  {
    id: "scaleInAll",
    title: "Scale In All",
    icon: (
      <div className="relative h-10 w-10">
        <span className="absolute bottom-0 left-0 h-5 w-5 rounded-md border-2 border-primary/70" />
        <span className="absolute right-0 top-0 h-7 w-7 rounded-md border-2 border-[var(--color-primary-fixed-dim)]" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary" />
      </div>
    ),
  },
  {
    id: "flipInAll",
    title: "Flip In All",
    icon: (
      <div className="relative flex h-10 w-10 items-center justify-center gap-1">
        <span className="h-7 w-3 rounded-md border-2 border-[var(--color-primary-fixed-dim)] bg-white" />
        <span className="h-7 w-3 rounded-md border-2 border-primary/80 bg-primary/10" />
        <span className="absolute right-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-primary" />
      </div>
    ),
  },
  {
    id: "slideUpMix",
    title: "Slide Up Mix",
    icon: (
      <div className="relative h-10 w-10">
        <span className="absolute left-0 top-4 h-0.5 w-6 rotate-45 bg-[var(--color-primary-fixed-dim)]" />
        <span className="absolute left-3 top-1 h-6 w-0.5 bg-primary" />
        <span className="absolute left-4 top-0 h-0 w-0 border-x-[5px] border-b-[7px] border-x-transparent border-b-primary" />
        <span className="absolute right-1 top-2 h-8 w-2 rotate-45 bg-[var(--color-primary-container)]/80" />
      </div>
    ),
  },
  {
    id: "fadeInMix",
    title: "Fade In Mix",
    icon: (
      <div className="relative h-10 w-10">
        <span className="absolute left-0 top-2 h-0.5 w-7 bg-primary/40" />
        <span className="absolute left-1 top-1 h-2 w-2 rounded-full border border-primary/50" />
        <span className="absolute right-0 top-1 h-0 w-0 border-y-[4px] border-l-[8px] border-y-transparent border-l-primary" />
        <span className="absolute bottom-2 left-0 h-0.5 w-8 bg-[var(--color-primary-fixed-dim)]" />
        <span className="absolute bottom-1 right-0 h-0 w-0 border-y-[4px] border-r-[8px] border-y-transparent border-r-[var(--color-primary-fixed-dim)]" />
      </div>
    ),
  },
];

const CATEGORY_ITEMS = [
  {
    id: "motion",
    title: "Hiệu ứng động",
    description: "Hiệu ứng chuyển động khi cuộn trang",
    icon: (
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5">
        <span className="absolute left-2 top-1/2 h-7 w-4 -translate-y-1/2 rounded-md border-2 border-primary/60 bg-white" />
        <span className="absolute right-2 top-1/2 h-7 w-4 -translate-y-1/2 rounded-md border-2 border-dashed border-[var(--color-primary-fixed-dim)] bg-white/80" />
      </div>
    ),
  },
  {
    id: "opening",
    title: "Hiệu ứng mở màn",
    description: "Ấn tượng đầu tiên khi mở trang",
    disabled: true,
    icon: (
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
        <span className="absolute left-3 top-2 h-8 w-1 rounded bg-amber-500" />
        <span className="absolute right-3 top-2 h-8 w-1 rounded bg-amber-500" />
        <span className="absolute left-4 top-4 h-0.5 w-4 rotate-[20deg] bg-amber-500" />
        <span className="absolute right-4 top-4 h-0.5 w-4 rotate-[-20deg] bg-amber-500" />
      </div>
    ),
  },
  {
    id: "falling",
    title: "Hiệu ứng rơi",
    description: "Hiệu ứng rơi trang trí trên trang",
    disabled: true,
    icon: (
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50">
        <span className="absolute left-1/2 top-2 h-8 w-0.5 -translate-x-1/2 bg-sky-500" />
        <span className="absolute left-1/2 top-1 h-8 w-0.5 -translate-x-1/2 rotate-90 bg-sky-500" />
        <span className="absolute left-1/2 top-2 h-7 w-0.5 -translate-x-1/2 rotate-45 bg-sky-400" />
        <span className="absolute left-1/2 top-2 h-7 w-0.5 -translate-x-1/2 -rotate-45 bg-sky-400" />
      </div>
    ),
  },
];

function buildAnimationPreset(
  presetId: MotionPresetId,
  index: number,
): AnimationSettings {
  const staggerDelay = Math.min(index * 0.08, 1.2);

  switch (presetId) {
    case "none":
      return {
        enabled: false,
        type: "Không có",
        duration: 0.9,
        delay: 0,
        easing: "Ease Out",
      };
    case "fadeInAll":
      return {
        enabled: true,
        type: "Fade in",
        duration: 0.9,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    case "slideUpAll":
      return {
        enabled: true,
        type: "Slide up",
        duration: 0.95,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    case "scaleInAll":
      return {
        enabled: true,
        type: "Scale in",
        duration: 0.85,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    case "flipInAll":
      return {
        enabled: true,
        type: "Flip in",
        duration: 0.95,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    case "slideUpMix": {
      const types = ["Slide up", "Slide left", "Slide right", "Scale in"];
      return {
        enabled: true,
        type: types[index % types.length],
        duration: 0.95,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    }
    case "fadeInMix": {
      const types = ["Fade in", "Scale in", "Slide up", "Fade in"];
      return {
        enabled: true,
        type: types[index % types.length],
        duration: 0.9,
        delay: staggerDelay,
        easing: "Ease Out",
      };
    }
  }
}

function getTopLevelAnimatableElements(elements: CanvasElement[]) {
  return [...elements]
    .filter((element) => !element.groupId)
    .sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return (a.zIndex || 0) - (b.zIndex || 0);
    });
}

function CategoryCard({
  title,
  description,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(7,2,53,0.04)] transition-all",
        disabled
          ? "cursor-not-allowed opacity-70"
          : "hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_14px_32px_rgba(7,2,53,0.08)]",
      )}
    >
      <div className="flex items-center gap-4">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-[20px] font-bold leading-none text-slate-800">
              {title}
            </h3>
            {disabled && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Sắp có
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
        </div>
        <RiArrowRightSLine size={18} className="text-slate-300" />
      </div>
    </button>
  );
}

function MotionPresetCard({
  preset,
  active,
  onClick,
}: {
  preset: MotionPreset;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-[18px] border px-4 py-5 text-center transition-all",
        active
          ? "border-primary/30 bg-primary/5 shadow-[0_10px_24px_rgba(7,2,53,0.1)]"
          : "border-slate-200 bg-white hover:border-primary/20 hover:bg-slate-50",
      )}
    >
      <div className="flex min-h-12 items-center justify-center text-primary">
        {preset.icon}
      </div>
      <div
        className={cn(
          "mt-3 text-base font-medium transition-colors",
          active ? "text-primary" : "text-slate-800",
        )}
      >
        {preset.title}
      </div>
    </button>
  );
}

export function EffectsPanel() {
  const { message } = App.useApp();
  const {
    elements,
    pushHistory,
    updateElements,
    previewAllAnimations,
    panelActiveTabs,
    setPanelActiveTab,
  } = useEditorStore();

  const [activePresetId, setActivePresetId] =
    React.useState<MotionPresetId>("fadeInAll");

  const view = (panelActiveTabs.effects as EffectsView | undefined) || "overview";
  const topLevelElements = React.useMemo(
    () => getTopLevelAnimatableElements(elements),
    [elements],
  );

  const openView = (nextView: EffectsView) => {
    setPanelActiveTab("effects", nextView);
  };

  const applyPreset = (presetId: MotionPresetId) => {
    if (topLevelElements.length === 0) {
      message.info("Chưa có phần tử nào để áp dụng hiệu ứng");
      return;
    }

    pushHistory("Áp dụng hiệu ứng cho tất cả");
    updateElements(
      topLevelElements.map((element, index) => ({
        id: element.id,
        changes: {
          animation: buildAnimationPreset(presetId, index),
        },
      })),
    );
    setActivePresetId(presetId);
    previewAllAnimations();
    message.success("Đã áp dụng hiệu ứng cho tất cả phần tử");
  };

  if (view === "motion") {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
          <button
            type="button"
            onClick={() => openView("overview")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <div className="min-w-0">
            <div className="font-sans text-lg font-bold text-primary">
              Hiệu ứng động
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              Áp dụng hiệu ứng cuộn trang cho toàn bộ phần tử.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(7,2,53,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                <RiMagicLine size={21} />
              </div>
              <div>
                <h3 className="font-sans text-[24px] font-bold leading-none text-slate-800">
                  Hiệu ứng dựng sẵn
                </h3>
              </div>
            </div>

            <div className="mt-5 text-[15px] leading-6 text-slate-500">
              Chọn 1 mẫu hiệu ứng để áp dụng cho toàn bộ trang
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {MOTION_PRESETS.map((preset) => (
                <MotionPresetCard
                  key={preset.id}
                  preset={preset}
                  active={activePresetId === preset.id}
                  onClick={() => applyPreset(preset.id)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="pt-5">
          <Button
            type="primary"
            onClick={previewAllAnimations}
            disabled={topLevelElements.length === 0}
            className="h-12 w-full rounded-2xl border-none bg-[var(--color-primary-container)] font-sans text-lg font-semibold shadow-[0_14px_30px_rgba(7,2,53,0.16)] hover:!bg-primary"
            icon={<RiImageLine size={18} />}
          >
            Xem trước hiệu ứng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-sans text-[28px] font-bold tracking-[-0.02em] text-slate-800">
          Hiệu ứng
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Chọn kiểu chuyển động và hiệu ứng toàn trang theo đúng theme của
          editor.
        </p>
      </div>

      <div className="space-y-4">
        {CATEGORY_ITEMS.map((item) => (
          <CategoryCard
            key={item.id}
            title={item.title}
            description={item.description}
            icon={item.icon}
            disabled={item.disabled}
            onClick={item.id === "motion" ? () => openView("motion") : undefined}
          />
        ))}
      </div>

      <div className="mt-6 rounded-[22px] border border-primary/10 bg-primary/5 px-4 py-4 text-sm leading-6 text-slate-600">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-white p-2 text-primary shadow-sm">
            <RiMagicLine size={18} />
          </div>
          <p>
            Mỗi lần áp dụng preset sẽ tạo <strong>một bước lịch sử duy nhất</strong>{" "}
            với tên <strong>&quot;Áp dụng hiệu ứng cho tất cả&quot;</strong> để
            undo thuận tiện hơn.
          </p>
        </div>
      </div>
    </div>
  );
}
