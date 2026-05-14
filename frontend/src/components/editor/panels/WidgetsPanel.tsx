"use client";

import React from "react";
import { RiArrowRightSLine, RiApps2Line, RiFileTextLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";

interface WidgetItem {
  id: string;
  label: string;
  icon: string;
  color?: string;
}

const UTILITIES: WidgetItem[] = [
  { id: "calendar", label: "Lịch", icon: "📅" },
  { id: "countdown", label: "Đếm ngược", icon: "⏰" },
  { id: "map", label: "Bản đồ", icon: "📍" },
  { id: "guest_names", label: "Tên khách mời", icon: "🤝" },
  { id: "special_effects", label: "Hiệu ứng đặc biệt", icon: "🪄" },
  { id: "envelope_effect", label: "Hiệu ứng phong bì", icon: "💌" },
  { id: "qr_gift", label: "Hộp quà QR", icon: "🎁" },
  { id: "video", label: "Nhúng Video", icon: "🎬" },
  { id: "photo_album", label: "Album Ảnh", icon: "🖼️" },
  { id: "carousel", label: "Carousel", icon: "🎠" },
];

const FORMS: WidgetItem[] = [
  { id: "attendance_form", label: "Form tham dự", icon: "📝" },
  { id: "contact_button", label: "Nút liên hệ", icon: "📞" },
  { id: "reminder", label: "Thêm lời nhắc", icon: "🔔" },
  { id: "guest_signature", label: "Chữ ký khách mời", icon: "✍️" },
];

export function WidgetsPanel() {
  const { addElement } = useEditorStore();

  const handleAddWidget = (item: WidgetItem) => {
    addElement("widget", { x: 50, y: 50 }, { 
      widgetType: item.id,
      config: {
        title: item.label,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        selectedDay: new Date().getDate(),
      }
    });
  };
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
        {/* Utilities Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">Tiện ích</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {UTILITIES.map((item) => (
              <WidgetCard key={item.id} item={item} onClick={() => handleAddWidget(item)} />
            ))}
          </div>
        </section>

        {/* Form Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">Form</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FORMS.map((item) => (
              <WidgetCard key={item.id} item={item} onClick={() => handleAddWidget(item)} />
            ))}
          </div>
        </section>

        {/* PRO Banner */}
        <div className="relative mt-8 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white text-xl">👑</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-bold text-slate-800 text-sm truncate">Nâng cấp giới hạn</h4>
                <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                Tăng giới hạn thiệp mời và lượt xem
              </p>
            </div>
            <RiArrowRightSLine className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" size={20} />
            
            {/* Decorative background shape */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-50 rounded-full blur-2xl opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetCard({ item, onClick }: { item: WidgetItem; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 rounded-2xl transition-all group gap-2"
    >
      <div className="w-12 h-12 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
        {item.icon}
      </div>
      <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-800 text-center">
        {item.label}
      </span>
    </button>
  );
}
