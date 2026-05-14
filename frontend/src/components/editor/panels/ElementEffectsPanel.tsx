"use client";

import React from "react";
import { Collapse, InputNumber, Select, Slider, Switch } from "antd";
import { RiArrowRightSLine, RiMagicLine } from "@remixicon/react";
import type { AnimationSettings } from "@/types/editor";

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-premium-label block ml-1 mb-1">{children}</label>
);

type EffectfulElement = {
  animation?: AnimationSettings;
  loopAnimation?: AnimationSettings;
};

type Props<T extends EffectfulElement> = {
  element: T;
  onUpdate: (updates: Partial<T>) => void;
  subjectLabel?: string;
  loopCollapseActiveKeys?: string[];
  onLoopCollapseChange?: (keys: string[]) => void;
};

export function ElementEffectsPanel<T extends EffectfulElement>({
  element,
  onUpdate,
  subjectLabel = "phần tử",
  loopCollapseActiveKeys,
  onLoopCollapseChange,
}: Props<T>) {
  const handleAnimationChange = (
    key: "animation" | "loopAnimation",
    updates: Partial<AnimationSettings>,
  ) => {
    const current = element[key] || {
      enabled: false,
      type: key === "animation" ? "Fade in" : "Lắc lư nhún nhảy",
      duration: key === "animation" ? 1.6 : 2.0,
      delay: 0,
      easing: "Ease Out",
    };

    onUpdate({
      [key]: { ...current, ...updates },
    } as Partial<T>);
  };

  const animation = element.animation || {
    enabled: false,
    type: "Fade in",
    duration: 1.6,
    delay: 0,
    easing: "Ease Out",
  };

  const loopAnimation = element.loopAnimation || {
    enabled: false,
    type: "Lắc lư nhún nhảy",
    duration: 2.0,
    delay: 0,
    easing: "Ease Out",
  };

  const collapseProps =
    loopCollapseActiveKeys && onLoopCollapseChange
      ? {
          activeKey: loopCollapseActiveKeys,
          onChange: (keys: string | string[]) =>
            onLoopCollapseChange(Array.isArray(keys) ? keys : [keys]),
        }
      : {
          defaultActiveKey: [],
        };

  return (
    <div className="px-1 py-2 space-y-4">
      <Collapse
        {...collapseProps}
        expandIconPlacement="start"
        className="editor-collapse"
        expandIcon={({ isActive }) => (
          <RiArrowRightSLine
            size={18}
            className={`transition-transform text-slate-300 ${isActive ? "rotate-90" : ""}`}
          />
        )}
        items={[
          {
            key: "motion",
            label: "Hiệu ứng chuyển động",
            children: (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>Bật hiệu ứng chuyển động</Label>
                  <Switch
                    checked={animation.enabled}
                    onChange={(val) =>
                      handleAnimationChange("animation", { enabled: val })
                    }
                    className={animation.enabled ? "!bg-primary" : ""}
                    size="middle"
                  />
                </div>

                {animation.enabled && (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 italic text-[13px] text-slate-600 leading-relaxed">
                      Khi mở thiệp, {subjectLabel} sẽ{" "}
                      <strong className="text-primary">{animation.type}</strong>{" "}
                      sau{" "}
                      <strong className="text-primary">
                        {animation.delay}s
                      </strong>{" "}
                      và trong{" "}
                      <strong className="text-primary">
                        {animation.duration}s
                      </strong>
                      ,{" "}
                      <strong className="text-primary italic">
                        chỉ chạy một lần.
                      </strong>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hiệu ứng</Label>
                        <Select
                          className="w-full editor-select"
                          value={animation.type}
                          onChange={(val) =>
                            handleAnimationChange("animation", { type: val })
                          }
                          options={[
                            { value: "Không có", label: "Không có" },
                            { value: "Fade in", label: "Fade in" },
                            { value: "Slide up", label: "Slide up" },
                            { value: "Slide down", label: "Slide down" },
                            { value: "Slide left", label: "Slide left" },
                            { value: "Slide right", label: "Slide right" },
                            { value: "Scale in", label: "Scale in" },
                            { value: "Scale out", label: "Scale out" },
                          ]}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Thời gian(s)</Label>
                        <div className="flex items-center gap-3">
                          <Slider
                            className="flex-1"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={animation.duration}
                            onChange={(val) =>
                              handleAnimationChange("animation", {
                                duration: val,
                              })
                            }
                            tooltip={{ open: false }}
                            trackStyle={{
                              backgroundColor: "var(--color-primary)",
                            }}
                            handleStyle={{
                              borderColor: "var(--color-primary)",
                            }}
                          />
                          <InputNumber
                            className="w-[60px] text-center font-bold rounded-lg border-slate-200"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={animation.duration}
                            onChange={(val) =>
                              handleAnimationChange("animation", {
                                duration: val || 1.6,
                              })
                            }
                            controls={false}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Độ trễ(s)</Label>
                        <div className="flex items-center gap-3">
                          <Slider
                            className="flex-1"
                            min={0}
                            max={5}
                            step={0.1}
                            value={animation.delay}
                            onChange={(val) =>
                              handleAnimationChange("animation", { delay: val })
                            }
                            tooltip={{ open: false }}
                            trackStyle={{
                              backgroundColor: "var(--color-primary)",
                            }}
                            handleStyle={{
                              borderColor: "var(--color-primary)",
                            }}
                          />
                          <InputNumber
                            className="w-[60px] text-center font-bold rounded-lg border-slate-200"
                            min={0}
                            max={5}
                            step={0.1}
                            value={animation.delay}
                            onChange={(val) =>
                              handleAnimationChange("animation", {
                                delay: val || 0,
                              })
                            }
                            controls={false}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Kiểu chuyển động</Label>
                        <Select
                          className="w-full editor-select"
                          value={animation.easing}
                          onChange={(val) =>
                            handleAnimationChange("animation", { easing: val })
                          }
                          options={[
                            { value: "Ease", label: "Ease" },
                            { value: "Ease In", label: "Ease In" },
                            { value: "Ease Out", label: "Ease Out" },
                            { value: "Ease In Out", label: "Ease In Out" },
                            { value: "Linear", label: "Linear" },
                            { value: "Smooth", label: "Smooth" },
                            { value: "Bounce", label: "Bounce" },
                            { value: "Elastic", label: "Elastic" },
                          ]}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ),
          },
          {
            key: "loop",
            label: "Vòng lặp",
            children: (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>Kích hoạt</Label>
                  <Switch
                    checked={loopAnimation.enabled}
                    onChange={(val) =>
                      handleAnimationChange("loopAnimation", { enabled: val })
                    }
                    className={loopAnimation.enabled ? "!bg-primary" : ""}
                    size="middle"
                  />
                </div>

                {loopAnimation.enabled && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 italic text-[13px] text-slate-600 leading-relaxed">
                      Khi mở thiệp, {subjectLabel} sẽ{" "}
                      <strong className="text-primary">
                        {loopAnimation.type}
                      </strong>{" "}
                      sau{" "}
                      <strong className="text-primary">
                        {loopAnimation.delay}s
                      </strong>{" "}
                      và trong{" "}
                      <strong className="text-primary">
                        {loopAnimation.duration}s
                      </strong>
                      ,{" "}
                      <strong className="text-primary italic">
                        lặp lại liên tục.
                      </strong>
                    </div>

                    <div className="space-y-2">
                      <Label>Hiệu ứng</Label>
                      <Select
                        className="w-full"
                        value={loopAnimation.type}
                        onChange={(val) =>
                          handleAnimationChange("loopAnimation", { type: val })
                        }
                        options={[
                          { value: "Không có", label: "Không có" },
                          { value: "Bay lơ lửng", label: "Bay lơ lửng" },
                          { value: "Nảy", label: "Nảy" },
                          { value: "Nhấp nháy", label: "Nhấp nháy" },
                          { value: "Xoay tròn", label: "Xoay tròn" },
                          { value: "Lắc", label: "Lắc" },
                          { value: "Lắc lư", label: "Lắc lư" },
                          {
                            value: "Lắc lư nhún nhảy",
                            label: "Lắc lư nhún nhảy",
                          },
                          { value: "Nhịp tim", label: "Nhịp tim" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Thời gian(s)</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          className="flex-1"
                          min={0.1}
                          max={10}
                          step={0.1}
                          value={loopAnimation.duration}
                          onChange={(val) =>
                            handleAnimationChange("loopAnimation", {
                              duration: val,
                            })
                          }
                          tooltip={{ open: false }}
                          trackStyle={{
                            backgroundColor: "var(--color-primary)",
                          }}
                          handleStyle={{
                            borderColor: "var(--color-primary)",
                          }}
                        />
                        <InputNumber
                          className="w-[60px] text-center font-bold rounded-lg"
                          min={0.1}
                          max={10}
                          step={0.1}
                          value={loopAnimation.duration}
                          onChange={(val) =>
                            handleAnimationChange("loopAnimation", {
                              duration: val || 2.0,
                            })
                          }
                          controls={false}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Độ trễ(s)</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          className="flex-1"
                          min={0}
                          max={10}
                          step={0.1}
                          value={loopAnimation.delay}
                          onChange={(val) =>
                            handleAnimationChange("loopAnimation", {
                              delay: val,
                            })
                          }
                          tooltip={{ open: false }}
                          trackStyle={{
                            backgroundColor: "var(--color-primary)",
                          }}
                          handleStyle={{
                            borderColor: "var(--color-primary)",
                          }}
                        />
                        <InputNumber
                          className="w-[60px] text-center font-bold rounded-lg"
                          min={0}
                          max={10}
                          step={0.1}
                          value={loopAnimation.delay}
                          onChange={(val) =>
                            handleAnimationChange("loopAnimation", {
                              delay: val || 0,
                            })
                          }
                          controls={false}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

