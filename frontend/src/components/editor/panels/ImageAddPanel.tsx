"use client";

import React from "react";
import { Spin, Tooltip, Popconfirm, App } from "antd";
import {
  RiUploadCloudLine,
  RiDeleteBinLine,
  RiImageAddLine,
  RiCheckLine,
  RiCloseLine,
  RiInformationLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { mediaApi, type MediaFile } from "@/api/media.api";

export function ImageAddPanel() {
  const { message } = App.useApp();
  const {
    addElement,
    selectedElementIds,
    elements,
    updateElement,
    pushHistory,
    isReplacingImage,
    setIsReplacingImage,
  } = useEditorStore();

  const selectedImageElement = React.useMemo(() => {
    if (selectedElementIds.length !== 1) return null;
    const el = elements.find((e) => e.id === selectedElementIds[0]);
    return el?.type === "image" ? el : null;
  }, [selectedElementIds, elements]);

  const [library, setLibrary] = React.useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const loadLibrary = React.useCallback(async () => {
    try {
      setLoadingLibrary(true);
      const files = await mediaApi.list();
      setLibrary(files);
    } catch {
      message.error("Không tải được thư viện ảnh");
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLibrary();
  }, [loadLibrary]);

  const handleUpload = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      message.error("Chỉ hỗ trợ JPG, PNG, WebP, GIF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error("File tối đa 10MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const media = await mediaApi.upload(file, setUploadProgress);
      setLibrary((prev) => [media, ...prev]);
      const dims = await getImageDimensions(media.url);

      if (selectedImageElement) {
        pushHistory("Thay đổi hình ảnh");
        updateElement(selectedImageElement.id, { url: media.url });
        message.success("Đã thay đổi ảnh");
      } else {
        addElement("image", undefined, { url: media.url, ...dims });
        message.success("Tải ảnh thành công");
      }
    } catch {
      message.error("Tải ảnh thất bại, thử lại");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const getImageDimensions = (
    url: string,
  ): Promise<{ width: number; height: number }> =>
    new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 400;
        const aspect = img.naturalWidth / img.naturalHeight;
        let w = Math.min(img.naturalWidth, MAX);
        let h = w / aspect;
        if (h > MAX) {
          h = MAX;
          w = h * aspect;
        }
        resolve({ width: Math.round(w), height: Math.round(h) });
      };
      img.onerror = () => resolve({ width: 300, height: 200 });
      img.src = url;
    });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await mediaApi.remove(id);
      setLibrary((prev) => prev.filter((f) => f.id !== id));
      message.success("Đã xóa ảnh");
    } catch {
      message.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const addToCanvas = async (media: MediaFile) => {
    if (isReplacingImage && selectedImageElement) {
      pushHistory("Thay đổi hình ảnh");
      updateElement(selectedImageElement.id, { url: media.url });
      message.success("Đã thay đổi ảnh");
      setIsReplacingImage(false);
    } else {
      const dims = await getImageDimensions(media.url);
      addElement("image", undefined, { url: media.url, ...dims });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        ref={dragRef}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none
          ${uploading ? "pointer-events-none border-primary/20 bg-primary/5" : isDragging ? "border-primary bg-primary/10" : "border-slate-200 bg-slate-50 hover:border-primary/30 hover:bg-primary/5"}`}
      >
        {uploading ? (
          <>
            <Spin size="small" />
            <span className="text-xs text-primary font-medium">
              {uploadProgress}%
            </span>
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-xl transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </>
        ) : (
          <>
            <RiUploadCloudLine
              size={28}
              className={`transition-colors ${isDragging ? "text-primary" : "text-slate-400"}`}
            />
            <p className="text-xs font-semibold text-slate-600">
              Kéo thả hoặc click để tải ảnh
            </p>
            <p className="text-[10px] text-slate-400">
              JPG, PNG, WebP, GIF · Tối đa 10MB
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Library */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Thư viện của bạn
          </span>
          <button
            onClick={loadLibrary}
            className="text-[10px] text-slate-400 hover:text-primary transition-colors"
          >
            Tải lại
          </button>
        </div>

        {isReplacingImage && (
          <div className="mb-3 p-2 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <RiInformationLine size={14} className="text-primary" />
              <span className="text-[12px] font-bold text-primary">Chọn ảnh để đổi</span>
            </div>
            <button 
              onClick={() => setIsReplacingImage(false)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-white transition-all uppercase tracking-tight"
            >
              Huỷ
            </button>
          </div>
        )}

        {loadingLibrary ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : library.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-slate-300">
            <RiImageAddLine size={32} className="mb-2" />
            <p className="text-xs">Chưa có ảnh nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {library.map((media) => (
              <div
                key={media.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                onClick={() => addToCanvas(media)}
              >
                <img
                  src={media.url}
                  alt={media.originalName}
                  className="w-full h-full object-cover"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Tooltip title="Thêm vào canvas">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCanvas(media);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <RiCheckLine size={14} className="text-slate-700" />
                    </button>
                  </Tooltip>
                  <Popconfirm
                    title="Xóa ảnh này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(media.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      {deletingId === media.id ? (
                        <Spin size="small" />
                      ) : (
                        <RiDeleteBinLine size={14} className="text-red-500" />
                      )}
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
