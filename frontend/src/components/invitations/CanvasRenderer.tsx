'use client';

import React from 'react';
import { CanvasData, CanvasElement, TextElement, ImageElement } from '@/types/editor';
import { resolveFontFamily } from '@/lib/editorFonts';

interface CanvasRendererProps {
  canvasData: CanvasData & { width?: number; height?: number };
  variableValues: Record<string, string | number>;
}

export function CanvasRenderer({ canvasData, variableValues = {} }: CanvasRendererProps) {
  if (!canvasData || !canvasData.elements) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <p className="text-secondary">Không có dữ liệu thiết kế</p>
      </div>
    );
  }

  // Basic rendering logic: translate elements to absolute divs
  // This is a simplified version of what the full editor would do
  return (
    <div 
      className="relative mx-auto bg-white shadow-2xl overflow-hidden"
      style={{
        width: canvasData.width || 794, // Default A4-ish ratio
        height: canvasData.height || 1123,
        transform: 'scale(1)', // Can be adjusted for zoom
        transformOrigin: 'top center',
      }}
    >
      {canvasData.elements.map((el: CanvasElement) => {
        if (el.type === 'text') {
          const textEl = el as TextElement;
          let content = textEl.content;
          
          // Replace variables in text
          if (typeof content === 'string') {
            content = content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
              const val = variableValues[key.trim()];
              return val !== undefined ? String(val) : `{{${key}}}`;
            });
          }

          return (
            <div
              key={textEl.id}
              style={{
                position: 'absolute',
                left: textEl.x,
                top: textEl.y,
                width: textEl.width,
                height: textEl.height,
                zIndex: textEl.zIndex,
                rotate: `${textEl.rotation || 0}deg`,
                opacity: textEl.opacity,
                fontSize: textEl.fontSize,
                fontFamily: resolveFontFamily(textEl.fontFamily),
                color: textEl.color,
                textAlign: textEl.textAlign,
                fontWeight: textEl.fontWeight,
                lineHeight: textEl.lineHeight,
              }}
            >
              {content}
            </div>
          );
        }

        if (el.type === 'image') {
          const imageEl = el as ImageElement;
          return (
            <div
              key={imageEl.id}
              style={{
                position: 'absolute',
                left: imageEl.x,
                top: imageEl.y,
                width: imageEl.width,
                height: imageEl.height,
                zIndex: imageEl.zIndex,
                rotate: `${imageEl.rotation || 0}deg`,
                opacity: imageEl.opacity,
              }}
            >
              <img 
                src={imageEl.url} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: imageEl.objectFit || 'cover' }} 
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
