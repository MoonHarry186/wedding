"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { 
  WidgetElement as WidgetElementType,
  CalendarWidgetConfig,
  CountdownWidgetConfig,
  MapWidgetConfig,
  VideoWidgetConfig,
  GiftWidgetConfig
} from "@/types/editor";
import { useEditorStore } from "@/store/editor.store";
import { useDrag } from "@/hooks/useDrag";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { getElementAnimationStyle } from "@/lib/editorAnimation";
import { useSmartGuideDrag } from "@/hooks/useSmartGuides";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface WidgetElementProps {
  element: WidgetElementType;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<WidgetElementType>) => void;
}

export function WidgetElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
}: WidgetElementProps) {
  const { zoom, pushHistory, setIsDraggingOrResizing, previewMode } = useEditorStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isVisible = useElementAnimation(containerRef);
  const { beginDrag, snapPosition, clearGuides } = useSmartGuideDrag();

  const handleMouseDown = useDrag(
    (x, y) => {
      const snapped = snapPosition({
        activeId: element.id,
        x,
        y,
        width: element.width,
        height: element.height,
      });
      const el = document.getElementById(`element-${element.id}`);
      if (el) {
        el.style.left = `${snapped.x}px`;
        el.style.top = `${snapped.y}px`;
      }
      const controls = document.getElementById("element-controls");
      if (controls) {
        controls.style.left = `${snapped.x}px`;
        controls.style.top = `${snapped.y}px`;
      }
    },
    zoom,
    () => {
      setIsDraggingOrResizing(true);
      beginDrag([element.id]);
      pushHistory("Di chuyển tiện ích");
    },
    (x, y) => {
      setIsDraggingOrResizing(false);
      const snapped = snapPosition({
        activeId: element.id,
        x,
        y,
        width: element.width,
        height: element.height,
      });
      clearGuides();
      onUpdate({ x: Math.round(snapped.x), y: Math.round(snapped.y) });
    }
  );

  const renderWidgetContent = () => {
    switch (element.widgetType) {
      case "calendar":
        return <CalendarWidget config={element.config} />;
      case "countdown":
        return <CountdownWidget config={element.config} />;
      case "map":
        return <MapWidget config={element.config} previewMode={previewMode} />;
      case "video":
        return <VideoWidget config={element.config} previewMode={previewMode} />;
      case "qr_gift":
        return <GiftWidget config={element.config} previewMode={previewMode} />;
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            <span className="text-2xl mb-2">🧩</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Widget
            </span>
          </div>
        );
    }
  };

  const animationStyle = React.useMemo(
    () => getElementAnimationStyle(element, isVisible),
    [element, isVisible],
  );

  return (
    <div
      id={`element-${element.id}`}
      ref={containerRef}
      className={cn(
        "editor-hover-outline-target absolute select-none transition-shadow",
        previewMode ? "cursor-default" : "cursor-move",
        isSelected && !previewMode && "z-[1000]"
      )}
      data-selected={isSelected ? "true" : "false"}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        // Common Styles
        backgroundColor: element.backgroundColor,
        padding: element.paddingSettings
          ? `${element.paddingSettings.top}px ${element.paddingSettings.right}px ${element.paddingSettings.bottom}px ${element.paddingSettings.left}px`
          : undefined,
        borderTop:
          element.border?.enabled &&
          (!element.border.sides || element.border.sides.includes("top"))
            ? `${element.border.width}px ${element.border.style} ${element.border.color}`
            : "none",
        borderRight:
          element.border?.enabled &&
          (!element.border.sides || element.border.sides.includes("right"))
            ? `${element.border.width}px ${element.border.style} ${element.border.color}`
            : "none",
        borderBottom:
          element.border?.enabled &&
          (!element.border.sides || element.border.sides.includes("bottom"))
            ? `${element.border.width}px ${element.border.style} ${element.border.color}`
            : "none",
        borderLeft:
          element.border?.enabled &&
          (!element.border.sides || element.border.sides.includes("left"))
            ? `${element.border.width}px ${element.border.style} ${element.border.color}`
            : "none",
        borderRadius: element.border
          ? `${element.border.radiusTopLeft || 0}px ${element.border.radiusTopRight || 0}px ${element.border.radiusBottomRight || 0}px ${element.border.radiusBottomLeft || 0}px`
          : undefined,
        boxShadow: element.boxShadow?.enabled
          ? `${element.boxShadow.offsetX}px ${element.boxShadow.offsetY}px ${element.boxShadow.blur}px ${element.boxShadow.spread || 0}px ${element.boxShadow.color}`
          : undefined,
        pointerEvents: previewMode ? "none" : "auto",
      }}
      onMouseDown={(e) => {
        if (previewMode) return;
        onSelect(e);
        handleMouseDown(e, element.x, element.y);
      }}
    >
      <div className="w-full h-full" style={animationStyle}>
        {renderWidgetContent()}
      </div>
    </div>
  );
}

function CalendarWidget({ config }: { config: CalendarWidgetConfig }) {
  const { 
    month, 
    year, 
    selectedDay, 
    fontFamily, 
    fontSize, 
    textColor, 
    backgroundColor, 
    primaryColor, 
    opacity 
  } = config;
  
  // Basic calendar logic
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div 
      className="w-full h-full rounded-2xl shadow-xl border border-slate-100 flex flex-col p-4 transition-all overflow-hidden"
      style={{ 
        backgroundColor: backgroundColor || "#fff",
        color: textColor || "#333",
        fontFamily: fontFamily || "Inter",
        opacity: opacity !== undefined ? opacity : 1
      }}
    >
      <div className="text-center mb-4">
        <h4 
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
          style={{ color: primaryColor || "#070235" }}
        >
          Tháng {month}
        </h4>
        <p className="text-lg font-bold">Năm {year}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-[9px] font-bold opacity-40 text-center uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, idx) => (
          <div 
            key={idx} 
            className={cn(
              "aspect-square flex items-center justify-center rounded-lg transition-all",
              day === null ? "opacity-0" : "hover:bg-slate-50",
              day === (config.selectedDay || config.selectedDay) && "text-white shadow-lg scale-110"
            )}
            style={{ 
              fontSize: `${fontSize || 14}px`,
              backgroundColor: (!config.activeIcon && (day === selectedDay || (config.showTwoDays && day === config.selectedDay2))) 
                ? (primaryColor || "#070235") 
                : "transparent",
              boxShadow: (!config.activeIcon && (day === selectedDay || (config.showTwoDays && day === config.selectedDay2))) 
                ? `0 8px 20px -4px ${primaryColor || "#070235"}40` 
                : "none",
              position: "relative"
            }}
          >
            <span className="relative z-10">{day}</span>
            {(day === selectedDay || (config.showTwoDays && day === config.selectedDay2)) && config.activeIcon && (
              <div className="absolute inset-0 flex items-center justify-center text-[24px] animate-pulse-subtle opacity-80 select-none pointer-events-none">
                {config.activeIcon}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div 
        className="mt-4 pt-4 border-t flex items-center justify-center gap-2"
        style={{ borderColor: `${textColor || "#333"}10` }}
      >
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse" 
          style={{ backgroundColor: primaryColor || "#070235" }}
        />
        <span 
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: primaryColor || "#070235" }}
        >
          Save the Date
        </span>
      </div>
    </div>
  );
}

function CountdownWidget({ config }: { config: CountdownWidgetConfig }) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { 
    targetDate, 
    title, 
    backgroundColor, 
    textColor, 
    borderColor,
    primaryColor,
    layout = "horizontal",
    language = "vi",
    spacing = 20,
    fontFamily = "Inter",
    fontSize = 14,
    opacity = 1
  } = config;

  const labels = {
    vi: { days: "Ngày", hours: "Giờ", minutes: "Phút", seconds: "Giây" },
    en: { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" }
  };

  const currentLabels = labels[language as keyof typeof labels] || labels.vi;

  React.useEffect(() => {
    const target = targetDate ? dayjs(targetDate) : dayjs().add(7, 'day');
    
    const calculateTimeLeft = () => {
      const now = dayjs();
      const diff = target.diff(now);
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const duration = dayjs.duration(diff);
      setTimeLeft({
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div 
      className={cn(
        "w-full h-full rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 overflow-hidden relative transition-all",
        layout === "vertical" ? "flex-col" : "flex-row"
      )}
      style={{ 
        backgroundColor: backgroundColor || "#0f172a",
        color: textColor || "#fff",
        fontFamily: fontFamily,
        opacity: opacity,
        borderColor: borderColor || "transparent",
        borderWidth: borderColor ? "1px" : "0px",
        borderStyle: "solid",
        gap: `${spacing}px`
      }}
    >
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] opacity-20 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at top right, ${primaryColor || "#070235"}, transparent, transparent)` }}
      />
      
      <div className={cn(
        "flex items-center z-10",
        layout === "vertical" ? "flex-col" : "flex-row"
      )} style={{ gap: `${spacing}px` }}>
        <div className="flex flex-col items-center">
          <span className="font-black" style={{ fontSize: `${(fontSize || 14) * 2}px` }}>{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{currentLabels.days}</span>
        </div>
        <span className="text-2xl font-light opacity-20" style={{ display: layout === "vertical" ? "none" : "block" }}>:</span>
        <div className="flex flex-col items-center">
          <span className="font-black" style={{ fontSize: `${(fontSize || 14) * 2}px` }}>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{currentLabels.hours}</span>
        </div>
        <span className="text-2xl font-light opacity-20" style={{ display: layout === "vertical" ? "none" : "block" }}>:</span>
        <div className="flex flex-col items-center">
          <span className="font-black" style={{ fontSize: `${(fontSize || 14) * 2}px` }}>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{currentLabels.minutes}</span>
        </div>
        <span className="text-2xl font-light opacity-20" style={{ display: layout === "vertical" ? "none" : "block" }}>:</span>
        <div className="flex flex-col items-center">
          <span className="font-black" style={{ fontSize: `${(fontSize || 14) * 2}px` }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{currentLabels.seconds}</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-6 right-6 h-1 bg-white/10 rounded-full overflow-hidden z-10">
        <div 
          className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
          style={{ 
            width: `${(timeLeft.seconds / 60) * 100}%`,
            backgroundColor: primaryColor || "#070235"
          }}
        />
      </div>
    </div>
  );
}

function MapWidget({ config, previewMode }: { config: MapWidgetConfig, previewMode?: boolean }) {
  const { address, lat, lng, zoom = 15, language = "vi" } = config;

  const getMapUrl = () => {
    const baseUrl = "https://www.google.com/maps/embed/v1/place";
    const apiKey = ""; // API key is usually needed for Embed API, but we can use search as fallback
    
    // Fallback search URL if no API Key
    const searchUrl = "https://maps.google.com/maps";
    const query = lat && lng ? `${lat},${lng}` : (address || "Hà Nội, Việt Nam");
    return `${searchUrl}?q=${encodeURIComponent(query)}&z=${zoom}&output=embed&hl=${language}`;
  };

  return (
    <div className="w-full h-full relative group">
      <iframe
        title="Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={getMapUrl()}
        allowFullScreen
      />
      {/* Overlay to allow dragging in editor without interacting with the map */}
      {!previewMode && (
        <div className="absolute inset-0 bg-transparent z-20 cursor-move" />
      )}
    </div>
  );
}

function VideoWidget({ config, previewMode }: { config: VideoWidgetConfig, previewMode?: boolean }) {
  const { videoUrl, autoplay, muted, controls, backgroundColor } = config;

  const getVideoId = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const videoId = getVideoId(videoUrl);

  const getEmbedUrl = () => {
    if (!videoId) return "";
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      controls: controls !== false ? "1" : "0",
      rel: "0",
      modestbranding: "1"
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  if (!videoId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl">
        <span className="text-2xl mb-2">🎬</span>
        <span className="text-xs opacity-50 uppercase tracking-widest">Chưa có video</span>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative group"
      style={{ backgroundColor: backgroundColor || "transparent" }}
    >
      <iframe
        title="YouTube video player"
        width="100%"
        height="100%"
        src={getEmbedUrl()}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {/* Overlay to allow dragging in editor without interacting with the video */}
      {!previewMode && (
        <div className="absolute inset-0 bg-transparent z-20 cursor-move" />
      )}
    </div>
  );
}

function GiftWidget({ config, previewMode }: { config: GiftWidgetConfig, previewMode?: boolean }) {
  const { icon = "🎁", backgroundColor, opacity = 1 } = config;

  return (
    <div 
      className={cn(
        "w-full h-full flex items-center justify-center group transition-all",
        !previewMode && "cursor-pointer"
      )}
      style={{ 
        backgroundColor: backgroundColor || "transparent",
        opacity: opacity 
      }}
    >
      <div className="text-6xl filter drop-shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-out">
        {icon}
      </div>
      {/* Tooltip or Label could go here */}
      {!previewMode && (
        <div className="absolute -bottom-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap">Gửi lời chúc & Quà tặng</span>
        </div>
      )}
    </div>
  );
}
