"use client";

import React from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { cn } from "@/lib/utils";
import { resolveFontFamily } from "@/lib/editorFonts";
import { applyInvitationVariablesToElements } from "@/lib/applyInvitationVariables";
import type {
  CanvasData,
  CanvasElement,
  CountdownWidgetConfig,
  GiftWidgetConfig,
  ImageElement,
  MapWidgetConfig,
  TextElement,
  VideoWidgetConfig,
  WidgetElement,
} from "@/types/editor";

dayjs.extend(duration);

const BASE_CANVAS_WIDTH = 500;
const SECTION_GAP_THRESHOLD = 96;

interface ResponsiveInvitationRendererProps {
  canvasData: CanvasData;
  variableValues: Record<string, string | number | boolean | Record<string, unknown>>;
}

interface FlattenedElement extends Omit<CanvasElement, "x" | "y"> {
  x: number;
  y: number;
}

interface ResponsiveSection {
  id: string;
  top: number;
  height: number;
  elements: FlattenedElement[];
}

export function ResponsiveInvitationRenderer({
  canvasData,
  variableValues = {},
}: ResponsiveInvitationRendererProps) {
  const flattenedElements = React.useMemo(
    () =>
      flattenCanvasElements(
        applyInvitationVariablesToElements(
          canvasData.elements || [],
          variableValues,
        ),
      ),
    [canvasData.elements, variableValues],
  );

  const sections = React.useMemo(
    () => createResponsiveSections(flattenedElements),
    [flattenedElements],
  );

  if (sections.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[32px] bg-white/80 p-8 text-slate-500 shadow-sm">
        Không có dữ liệu thiết kế
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[680px] overflow-hidden rounded-[32px] bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur"
      style={{
        backgroundColor: canvasData.backgroundImage
          ? "transparent"
          : resolveBackgroundColor(canvasData.backgroundColor),
        backgroundImage: canvasData.backgroundImage
          ? `url(${canvasData.backgroundImage})`
          : canvasData.backgroundColor?.startsWith("linear-gradient")
            ? canvasData.backgroundColor
            : undefined,
        backgroundSize: canvasData.backgroundSize || "cover",
        backgroundRepeat: canvasData.backgroundRepeat || "no-repeat",
        backgroundPosition: canvasData.backgroundPosition || "center",
        backgroundAttachment: canvasData.backgroundAttachment || "scroll",
      }}
    >
      {sections.map((section) => (
        <ResponsiveSectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}

function ResponsiveSectionBlock({ section }: { section: ResponsiveSection }) {
  return (
    <section
      className="relative isolate w-full overflow-hidden"
      style={{
        aspectRatio: `${BASE_CANVAS_WIDTH} / ${Math.max(section.height, 1)}`,
      }}
    >
      {section.elements.map((element) => (
        <ResponsiveElementNode
          key={element.id}
          element={element}
          sectionTop={section.top}
          sectionHeight={section.height}
        />
      ))}
    </section>
  );
}

function ResponsiveElementNode({
  element,
  sectionTop,
  sectionHeight,
}: {
  element: FlattenedElement;
  sectionTop: number;
  sectionHeight: number;
}) {
  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: `${(element.x / BASE_CANVAS_WIDTH) * 100}%`,
    top: `${((element.y - sectionTop) / sectionHeight) * 100}%`,
    width: `${(element.width / BASE_CANVAS_WIDTH) * 100}%`,
    minHeight: `${(element.height / sectionHeight) * 100}%`,
    opacity: element.opacity,
    zIndex: element.zIndex,
    transform: `rotate(${element.rotation || 0}deg)`,
    transformOrigin: "center center",
  };

  const body = (() => {
    if (element.type === "text") {
      return <ResponsiveTextNode element={element as TextElement} />;
    }

    if (element.type === "image") {
      return <ResponsiveImageNode element={element as ImageElement} />;
    }

    if (element.type === "widget") {
      return <ResponsiveWidgetNode element={element as WidgetElement} />;
    }

    return null;
  })();

  if (!body) return null;

  if (element.link?.url) {
    return (
      <a
        href={element.link.url}
        target={element.link.target || "_blank"}
        rel="noreferrer"
        style={wrapperStyle}
      >
        {body}
      </a>
    );
  }

  return <div style={wrapperStyle}>{body}</div>;
}

function ResponsiveTextNode({
  element,
}: {
  element: TextElement;
}) {
  return (
    <div
      style={{
        width: "100%",
        color: element.color,
        fontFamily: resolveFontFamily(element.fontFamily),
        fontWeight: element.fontWeight,
        fontSize: `clamp(${Math.max(12, element.fontSize * 0.72)}px, ${(element.fontSize / BASE_CANVAS_WIDTH) * 100}vw, ${element.fontSize}px)`,
        lineHeight: element.lineHeight || 1.2,
        letterSpacing: element.letterSpacing,
        textAlign: element.textAlign,
        textTransform: element.textTransform,
        textDecoration: element.textDecoration,
        fontStyle: element.fontStyle,
        writingMode: element.writingMode,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        backgroundColor: element.backgroundColor,
        padding: element.paddingSettings
          ? `${element.paddingSettings.top}px ${element.paddingSettings.right}px ${element.paddingSettings.bottom}px ${element.paddingSettings.left}px`
          : undefined,
        borderTop: resolveBorderSide(element.border, "top"),
        borderRight: resolveBorderSide(element.border, "right"),
        borderBottom: resolveBorderSide(element.border, "bottom"),
        borderLeft: resolveBorderSide(element.border, "left"),
        borderRadius: resolveBorderRadius(element.border),
        textShadow: resolveShadow(element.textShadow),
        boxShadow: resolveShadow(element.boxShadow),
      }}
    >
      {element.content}
    </div>
  );
}

function ResponsiveImageNode({ element }: { element: ImageElement }) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        !element.url &&
          "flex items-center justify-center border border-dashed border-slate-200 bg-white/70",
      )}
      style={{
        backgroundColor: element.backgroundColor || "transparent",
        padding: element.paddingSettings
          ? `${element.paddingSettings.top}px ${element.paddingSettings.right}px ${element.paddingSettings.bottom}px ${element.paddingSettings.left}px`
          : undefined,
        borderTop: resolveBorderSide(element.border, "top"),
        borderRight: resolveBorderSide(element.border, "right"),
        borderBottom: resolveBorderSide(element.border, "bottom"),
        borderLeft: resolveBorderSide(element.border, "left"),
        borderRadius: resolveBorderRadius(element.border),
        boxShadow: resolveShadow(element.boxShadow),
        clipPath:
          element.clipShape && element.clipShape !== "none"
            ? element.clipShape
            : undefined,
      }}
    >
      {element.url ? (
        element.cropData ? (
          <img
            src={element.url}
            alt=""
            className="absolute block max-h-none max-w-none"
            style={{
              width: `${100 / element.cropData.width}%`,
              height: `${100 / element.cropData.height}%`,
              left: `${(-element.cropData.x / element.cropData.width) * 100}%`,
              top: `${(-element.cropData.y / element.cropData.height) * 100}%`,
              objectFit: "fill",
            }}
          />
        ) : (
          <img
            src={element.url}
            alt=""
            className="h-full w-full"
            style={{
              objectFit: element.objectFit || "cover",
              borderRadius: "inherit",
            }}
          />
        )
      ) : (
        <div className="px-4 text-center text-xs text-slate-400">
          Chưa có ảnh
        </div>
      )}
    </div>
  );
}

function ResponsiveWidgetNode({ element }: { element: WidgetElement }) {
  if (element.widgetType === "calendar") {
    return <ResponsiveCalendarWidget config={element.config} />;
  }

  if (element.widgetType === "countdown") {
    return <ResponsiveCountdownWidget config={element.config} />;
  }

  if (element.widgetType === "map") {
    return <ResponsiveMapWidget config={element.config} />;
  }

  if (element.widgetType === "video") {
    return <ResponsiveVideoWidget config={element.config} />;
  }

  if (element.widgetType === "qr_gift") {
    return <ResponsiveGiftWidget config={element.config} />;
  }

  return null;
}

function ResponsiveCalendarWidget({
  config,
}: {
  config: WidgetElement["config"];
}) {
  if (!("month" in config) || !("year" in config)) return null;

  const month = config.month;
  const year = config.year;
  const selectedDay = config.selectedDay;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const days: Array<number | null> = Array.from(
    { length: firstDayOfMonth },
    () => null,
  );
  for (let day = 1; day <= daysInMonth; day += 1) days.push(day);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white/90 p-4 shadow-lg"
      style={{
        backgroundColor: config.backgroundColor || "#ffffff",
        color: config.textColor || "#333333",
        fontFamily: resolveFontFamily(config.fontFamily || "Inter"),
        opacity: config.opacity ?? 1,
      }}
    >
      <div className="mb-4 text-center">
        <div
          className="mb-1 text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: config.primaryColor || "#f43f5e" }}
        >
          Tháng {month}
        </div>
        <div className="text-lg font-bold">Năm {year}</div>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => (
          <div
            key={label}
            className="text-center text-[9px] font-bold uppercase opacity-40"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((day, index) => {
          const active =
            day === selectedDay ||
            (config.showTwoDays && day === config.selectedDay2);
          return (
            <div
              key={`${day ?? "empty"}-${index}`}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-[11px] font-semibold",
                day === null && "opacity-0",
                active && "text-white shadow-lg",
              )}
              style={{
                backgroundColor: active
                  ? config.primaryColor || "#f43f5e"
                  : "transparent",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResponsiveCountdownWidget({
  config,
}: {
  config: CountdownWidgetConfig;
}) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const target = config.targetDate
      ? dayjs(config.targetDate)
      : dayjs().add(7, "day");

    const update = () => {
      const diff = target.diff(dayjs());
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const remaining = dayjs.duration(diff);
      setTimeLeft({
        days: Math.floor(remaining.asDays()),
        hours: remaining.hours(),
        minutes: remaining.minutes(),
        seconds: remaining.seconds(),
      });
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [config.targetDate]);

  const labels =
    config.language === "en"
      ? { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" }
      : { days: "Ngày", hours: "Giờ", minutes: "Phút", seconds: "Giây" };

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[28px] p-6 shadow-xl",
        config.layout === "vertical" ? "flex-col" : "flex-row",
      )}
      style={{
        backgroundColor: config.backgroundColor || "#0f172a",
        color: config.textColor || "#ffffff",
        fontFamily: resolveFontFamily(config.fontFamily || "Inter"),
        opacity: config.opacity ?? 1,
        gap: `${config.spacing || 20}px`,
        border: config.borderColor ? `1px solid ${config.borderColor}` : "none",
      }}
    >
      {[
        ["days", timeLeft.days],
        ["hours", timeLeft.hours],
        ["minutes", timeLeft.minutes],
        ["seconds", timeLeft.seconds],
      ].map(([key, value]) => (
        <div key={key} className="flex flex-col items-center">
          <span
            className="font-black"
            style={{ fontSize: `${(config.fontSize || 14) * 2}px` }}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
            {labels[key as keyof typeof labels]}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResponsiveMapWidget({ config }: { config: MapWidgetConfig }) {
  const query =
    config.lat && config.lng
      ? `${config.lat},${config.lng}`
      : config.address || "Hà Nội, Việt Nam";

  return (
    <div className="h-full w-full overflow-hidden rounded-[24px] shadow-lg">
      <iframe
        title="Map"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${config.zoom || 15}&output=embed&hl=${config.language || "vi"}`}
        width="100%"
        height="100%"
        style={{ border: 0, opacity: config.opacity ?? 1 }}
        allowFullScreen
      />
    </div>
  );
}

function ResponsiveVideoWidget({ config }: { config: VideoWidgetConfig }) {
  const videoId = extractYouTubeId(config.videoUrl);
  if (!videoId) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-slate-900 text-sm text-white/70">
        Chưa có video
      </div>
    );
  }

  const params = new URLSearchParams({
    autoplay: config.autoplay ? "1" : "0",
    mute: config.muted ? "1" : "0",
    controls: config.controls !== false ? "1" : "0",
    rel: "0",
    modestbranding: "1",
  });

  return (
    <div
      className="h-full w-full overflow-hidden rounded-[24px] shadow-lg"
      style={{ backgroundColor: config.backgroundColor || "transparent" }}
    >
      <iframe
        title="Video"
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        width="100%"
        height="100%"
        style={{ border: 0, opacity: config.opacity ?? 1 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ResponsiveGiftWidget({ config }: { config: GiftWidgetConfig }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[28px] bg-white/80 p-6 text-center shadow-xl"
      style={{
        backgroundColor: config.backgroundColor || "rgba(255,255,255,0.82)",
        opacity: config.opacity ?? 1,
      }}
    >
      <div className="text-6xl">{config.icon || "🎁"}</div>
      <div className="text-xs font-black uppercase tracking-[0.24em] text-rose-500">
        {config.modalTitle || "Gửi lời chúc & Quà tặng"}
      </div>
      {config.accounts?.length ? (
        <div className="w-full space-y-2">
          {config.accounts.slice(0, 2).map((account) => (
            <div
              key={account.id}
              className="rounded-2xl border border-rose-100 bg-white/90 px-4 py-3 text-left text-sm text-slate-600"
            >
              <div className="font-bold text-slate-800">
                {account.recipientName}
              </div>
              <div>{account.bankName}</div>
              <div className="font-mono text-xs">{account.accountNumber}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function flattenCanvasElements(
  elements: CanvasElement[],
  offsetX = 0,
  offsetY = 0,
): FlattenedElement[] {
  const byId = new Map(elements.map((element) => [element.id, element]));

  const walk = (
    source: CanvasElement,
    parentX: number,
    parentY: number,
  ): FlattenedElement[] => {
    if (source.type === "group") {
      return (source.childIds || []).flatMap((childId) => {
        const child = byId.get(childId);
        if (!child) return [];
        return walk(child, parentX + source.x, parentY + source.y);
      });
    }

    return [
      {
        ...source,
        x: source.x + parentX,
        y: source.y + parentY,
      },
    ];
  };

  return elements
    .filter((element) => !element.groupId)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    .flatMap((element) => walk(element, offsetX, offsetY));
}

function createResponsiveSections(
  elements: FlattenedElement[],
): ResponsiveSection[] {
  if (elements.length === 0) return [];

  const sorted = [...elements].sort((a, b) => a.y - b.y);
  const sections: ResponsiveSection[] = [];
  let currentTop = sorted[0].y;
  let currentBottom = sorted[0].y + sorted[0].height;
  let currentElements: FlattenedElement[] = [sorted[0]];

  for (const element of sorted.slice(1)) {
    const elementBottom = element.y + element.height;
    if (element.y <= currentBottom + SECTION_GAP_THRESHOLD) {
      currentBottom = Math.max(currentBottom, elementBottom);
      currentElements.push(element);
      continue;
    }

    sections.push({
      id: `section-${sections.length}`,
      top: currentTop,
      height: Math.max(160, currentBottom - currentTop),
      elements: currentElements,
    });

    currentTop = element.y;
    currentBottom = elementBottom;
    currentElements = [element];
  }

  sections.push({
    id: `section-${sections.length}`,
    top: currentTop,
    height: Math.max(160, currentBottom - currentTop),
    elements: currentElements,
  });

  return sections;
}

function resolveBackgroundColor(color?: string) {
  if (!color || color.startsWith("linear-gradient")) return "transparent";
  return color;
}

function resolveBorderSide(
  border: CanvasElement["border"],
  side: "top" | "right" | "bottom" | "left",
) {
  if (!border?.enabled) return "none";
  if (border.sides && !border.sides.includes(side)) return "none";
  return `${border.width}px ${border.style} ${border.color}`;
}

function resolveBorderRadius(border: CanvasElement["border"]) {
  if (!border) return undefined;
  return `${border.radiusTopLeft || 0}px ${border.radiusTopRight || 0}px ${border.radiusBottomRight || 0}px ${border.radiusBottomLeft || 0}px`;
}

function resolveShadow(
  shadow?: CanvasElement["boxShadow"] | TextElement["textShadow"],
) {
  if (!shadow?.enabled) return undefined;
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread || 0}px ${shadow.color}`;
}

function extractYouTubeId(url: string) {
  if (!url) return "";
  const pattern =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]*).*/;
  const match = url.match(pattern);
  if (match && match[2].length === 11) return match[2];
  return url;
}
