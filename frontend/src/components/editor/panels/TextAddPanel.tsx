'use client';

import React from 'react';
import { Button, Input, Badge } from 'antd';
import { 
  RiSearchLine, 
  RiMagicLine, 
  RiVipCrownFill, 
  RiApps2Line,
  RiHistoryLine,
  RiAddLine
} from '@remixicon/react';
import { useEditorStore } from '@/store/editor.store';

export function TextAddPanel() {
  const { addElement } = useEditorStore();

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Default Text Styles */}
      <div className="space-y-4">
        <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider px-1">Kiểu văn bản mặc định</h3>
        <div className="space-y-2">
          <button 
            className="w-full p-4 bg-white border border-slate-100 hover:border-primary hover:shadow-md transition-all rounded-xl text-left group"
            onClick={() => addElement('text', undefined, { 
              fontSize: 48, 
              fontWeight: 900, 
              content: 'THÊM TIÊU ĐỀ',
              textAlign: 'center',
              width: 400
            })}
          >
            <span className="text-2xl font-black text-slate-900 block leading-tight">Thêm tiêu đề</span>
          </button>
          <button 
            className="w-full p-3 bg-white border border-slate-100 hover:border-primary hover:shadow-md transition-all rounded-xl text-left group"
            onClick={() => addElement('text', undefined, { 
              fontSize: 28, 
              fontWeight: 700, 
              content: 'Thêm tiêu đề phụ',
              textAlign: 'center',
              width: 300
            })}
          >
            <span className="text-lg font-bold text-slate-800 block leading-tight">Thêm tiêu đề phụ</span>
          </button>
          <button 
            className="w-full p-2.5 bg-white border border-slate-100 hover:border-primary hover:shadow-md transition-all rounded-xl text-left group"
            onClick={() => addElement('text', undefined, { 
              fontSize: 16, 
              fontWeight: 400, 
              content: 'Thêm một ít nội dung văn bản',
              textAlign: 'center',
              width: 250
            })}
          >
            <span className="text-[13px] text-slate-600 block leading-tight">Thêm một ít nội dung văn bản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
