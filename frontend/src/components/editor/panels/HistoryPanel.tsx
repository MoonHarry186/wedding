'use client';

import React from 'react';
import { Timeline, Empty } from 'antd';
import { RiHistoryLine, RiCheckboxCircleFill } from '@remixicon/react';
import { useEditorStore } from '@/store/editor.store';
import { cn } from '@/lib/utils';

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date(timestamp));
};

export function HistoryPanel() {
  const { history, future, jumpToHistory, jumpToFuture, redo, undo } = useEditorStore();

  const handleJump = (index: number) => {
    jumpToHistory(index);
  };

  const handleJumpFuture = (index: number) => {
    jumpToFuture(index);
  };

  // Tổng hợp danh sách để hiển thị như Photoshop
  // History: Các bước đã qua
  // Current: Trạng thái hiện tại (không có trong history/future stack nhưng là elements hiện tại)
  // Future: Các bước đã undo (hiển thị mờ)

  const hasHistory = history.length > 0 || future.length > 0;

  if (!hasHistory) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
            <RiHistoryLine size={18} className="text-[#070235]" />
            Lịch sử thao tác
          </h3>
          <p className="text-[11px] text-slate-500">
            Theo dõi và quay lại các bước chỉnh sửa của bạn.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Empty description="Chưa có thao tác nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-1">
          <RiHistoryLine size={18} className="text-[#070235]" />
          Lịch sử thao tác
        </h3>
        <p className="text-[11px] text-slate-500">
          Click vào một bước để quay lại trạng thái đó.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-1">
          {/* History Items */}
          {history.map((step, index) => (
            <button
              key={`hist-${index}-${step.timestamp}`}
              onClick={() => handleJump(index)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white border border-transparent group-hover:border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-700 truncate">{step.name}</span>
                <span className="text-[9px] text-slate-400">
                  {formatTime(step.timestamp)}
                </span>
              </div>
            </button>
          ))}

          {/* Current State Indicator */}
          <div className="flex items-center gap-3 w-full p-2 rounded-lg bg-primary/5 border border-primary/10 my-1">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <RiCheckboxCircleFill size={16} className="text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-primary">Trạng thái hiện tại</span>
              <span className="text-[9px] text-primary/60 font-medium italic">Đang hoạt động</span>
            </div>
          </div>

          {/* Future Items (Redoable) */}
          {future.map((step, index) => (
            <button
              key={`future-${index}-${step.timestamp}`}
              onClick={() => handleJumpFuture(index)}
              className="flex items-center gap-3 w-full p-2 rounded-lg opacity-40 hover:opacity-100 transition-all group text-left grayscale"
            >
              <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-300">+{index + 1}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-500 truncate">{step.name}</span>
                <span className="text-[9px] text-slate-300">
                  {formatTime(step.timestamp)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
        >
          Hoàn tác
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="flex-1 py-2 rounded-lg bg-[#070235] text-xs font-bold text-white hover:bg-[#070235]/90 disabled:opacity-30 transition-colors"
        >
          Làm lại
        </button>
      </div>
    </div>
  );
}
