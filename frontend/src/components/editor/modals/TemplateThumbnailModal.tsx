"use client";

import React, { useCallback } from "react";
import { Modal, Spin } from "antd";
import {
  RiCheckLine,
  RiRefreshLine,
  RiUploadCloudLine,
} from "@remixicon/react";
import type { MediaFile } from "@/api/media.api";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  uploadedImages: MediaFile[];
  loadingUploadedImages: boolean;
  uploadingImage: boolean;
  selectedUrl?: string | null;
  title?: string;
  libraryLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  uploadButtonLabel?: string;
  uploadMoreButtonLabel?: string;
  onCancel: () => void;
  onRefresh: () => void;
  onUpload: (file: File) => void;
  onSelect: (url: string) => void;
};

export function TemplateThumbnailModal({
  open,
  uploadedImages,
  loadingUploadedImages,
  uploadingImage,
  selectedUrl,
  title = "Chọn ảnh đã tải lên",
  libraryLabel = "Thư viện của bạn",
  emptyTitle = "Chưa có ảnh nào được tải lên",
  emptyDescription = "Tải ảnh lên ngay để dùng",
  uploadButtonLabel = "Tải ảnh lên",
  uploadMoreButtonLabel = "Tải thêm ảnh",
  onCancel,
  onRefresh,
  onUpload,
  onSelect,
}: Props) {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      onUpload(file);
      event.target.value = "";
    },
    [onUpload],
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      title={title}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {libraryLabel}
          </span>
          <div className="flex items-center gap-3">
            {uploadedImages.length > 0 && (
              <span className="text-[10px] text-slate-400">
                {uploadedImages.length} ảnh
              </span>
            )}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingUploadedImages}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RiRefreshLine size={14} />
              Tải lại
            </button>
          </div>
        </div>

        {loadingUploadedImages ? (
          <div className="flex justify-center py-10">
            <Spin size="small" />
          </div>
        ) : uploadedImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-400">
            <div className="flex flex-col items-center gap-3">
              {uploadingImage ? (
                <Spin size="small" />
              ) : (
                <RiUploadCloudLine size={28} className="text-slate-300" />
              )}
              <div className="space-y-1">
                <p className="font-medium text-slate-500">
                  {emptyTitle}
                </p>
                <p className="text-xs text-slate-400">
                  {emptyDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RiUploadCloudLine size={16} />
                {uploadingImage ? "Đang tải lên..." : uploadButtonLabel}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RiUploadCloudLine size={16} />
                {uploadingImage ? "Đang tải lên..." : uploadMoreButtonLabel}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {uploadedImages.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => onSelect(media.url)}
                  className={cn(
                    "aspect-square rounded-xl border-2 transition-all relative overflow-hidden group",
                    selectedUrl === media.url
                      ? "border-primary scale-105 shadow-md"
                      : "border-gray-200 hover:border-slate-200",
                  )}
                  title={media.originalName}
                >
                  <img
                    src={media.url}
                    className="w-full h-full object-cover"
                    alt={media.originalName}
                  />
                  {selectedUrl === media.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-1 shadow-lg">
                        <RiCheckLine className="text-primary" size={16} />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUploadInput}
        />
      </div>
    </Modal>
  );
}
