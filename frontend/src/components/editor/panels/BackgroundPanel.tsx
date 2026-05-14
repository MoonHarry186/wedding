import React, { useState, useEffect, useRef, useCallback } from "react";
import { ColorPicker, Tooltip, Spin } from "antd";
import {
  RiPaletteLine,
  RiImageLine,
  RiCheckLine,
  RiImageAddLine,
} from "@remixicon/react";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";
import { TemplateThumbnailModal } from "@/components/editor/modals/TemplateThumbnailModal";
import { EditorSegmentedPanel } from "@/components/editor/EditorSegmentedPanel";
import { mediaApi, type StockAsset, type MediaFile } from "@/api/media.api";

const BACKGROUND_PAGE_SIZE = 24;

const DEFAULT_COLORS = [
  // Grayscale & Neutrals
  "#ffffff",
  "#f8f9fa",
  "#f1f3f5",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#868e96",
  "#495057",
  "#343a40",
  "#212529",
  "#000000",
  // Blues & Indigos
  "#e7f5ff",
  "#a5d8ff",
  "#339af0",
  "#070235",
  "#1e1b4b",
  "#edf2ff",
  "#bac8ff",
  "#5c7cfa",
  "#f3f0ff",
  "#eebefa",
  "#be4bdb",
  "#7950f2",
  // Warm Tones (Red, Pink, Orange)
  "#fff5f5",
  "#ffc9c9",
  "#ff8787",
  "#fa5252",
  "#e03131",
  "#c92a2a",
  "#fff0f6",
  "#fcc2d7",
  "#f06595",
  "#d6336c",
  "#a61e4d",
  "#fd7e14",
  // Greens & Yellows
  "#ebfbee",
  "#b2f2bb",
  "#51cf66",
  "#2b8a3e",
  "#fff9db",
  "#fcc419",
];

const GRADIENTS = [
  // Pastels & Soft
  "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",

  // Warm & Vibrant
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
  "linear-gradient(135deg, #f83600 0%, #f9d423 100%)",
  "linear-gradient(135deg, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)",

  // Cool & Deep
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
  "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)",
  "linear-gradient(135deg, #09203f 0%, #537895 100%)",

  // Nature & Earthy
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #accbee 0%, #e7f0fd 100%)",
  "linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)",
];

export function BackgroundPanel() {
  const {
    backgroundColor,
    backgroundImage,
    setBackgroundColor,
    setBackgroundImage,
  } = useEditorStore();
  const [activeTab, setActiveTab] = useState("color");
  const [stockBackgrounds, setStockBackgrounds] = useState<StockAsset[]>([]);
  const [uploadedImages, setUploadedImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingUploadedImages, setLoadingUploadedImages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isUploadedImagesModalOpen, setIsUploadedImagesModalOpen] =
    useState(false);
  const [backgroundCategory, setBackgroundCategory] = useState<string | null>(
    null,
  );
  const nextCursorRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingMoreRef = useRef(false);

  const loadBackgroundsPage = useCallback(
    async (category: string, reset = false) => {
      if (loadingMoreRef.current && !reset) return;

      loadingMoreRef.current = true;
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await mediaApi.stockAssetsPage(category, {
          limit: BACKGROUND_PAGE_SIZE,
          cursor: reset ? null : nextCursorRef.current,
        });

        nextCursorRef.current = response.nextCursor;
        setHasMore(response.hasMore);
        setStockBackgrounds((prev) =>
          reset ? response.items : [...prev, ...response.items],
        );
      } catch (error) {
        console.error("Failed to fetch backgrounds:", error);
      } finally {
        loadingMoreRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    const fetchBackgrounds = async () => {
      setLoading(true);
      try {
        const categories = await mediaApi.stockCategories();
        const bgCat = categories.find((cat) =>
          ["background", "nền", "hình nền"].includes(cat.toLowerCase()),
        );

        if (bgCat) {
          setBackgroundCategory(bgCat);
          nextCursorRef.current = null;
          await loadBackgroundsPage(bgCat, true);
        } else {
          setStockBackgrounds([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch backgrounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgrounds();
  }, [loadBackgroundsPage]);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || !backgroundCategory) return;

      observerRef.current = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (
          entry?.isIntersecting &&
          hasMore &&
          !loading &&
          !loadingMore &&
          nextCursorRef.current
        ) {
          void loadBackgroundsPage(backgroundCategory);
        }
      });

      observerRef.current.observe(node);
    },
    [backgroundCategory, hasMore, loading, loadingMore, loadBackgroundsPage],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  const loadUploadedImages = useCallback(async () => {
    setLoadingUploadedImages(true);
    try {
      const files = await mediaApi.list();
      setUploadedImages(files);
    } catch (error) {
      console.error("Failed to fetch uploaded images:", error);
    } finally {
      setLoadingUploadedImages(false);
    }
  }, []);

  const openUploadedImagesModal = useCallback(async () => {
    setIsUploadedImagesModalOpen(true);
    if (uploadedImages.length === 0) {
      await loadUploadedImages();
    }
  }, [loadUploadedImages, uploadedImages.length]);

  const handleBackgroundUpload = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setUploadingImage(true);
    try {
      const media = await mediaApi.upload(file);
      setUploadedImages((prev) => [media, ...prev]);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const currentBgStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: backgroundColor };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden flex flex-col">
        <EditorSegmentedPanel
          value={activeTab}
          onChange={setActiveTab}
          stickyHeader
          contentClassName="max-h-[calc(100vh-200px)]"
          items={[
            {
              key: "color",
              label: "Màu nền",
              icon: <RiPaletteLine size={16} />,
              content: (
                <div className="p-2 space-y-6">
              {/* Current Selection Preview */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Nền đang chọn
                </span>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full border border-gray-200 shadow-lg flex-shrink-0"
                    style={currentBgStyle}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-700">
                      {backgroundImage ? "Hình nền" : "Màu nền"}
                    </span>
                    <span
                      className="text-xs text-slate-500 font-mono line-clamp-2 break-all"
                      title={
                        backgroundImage
                          ? "Image Selected"
                          : backgroundColor.toUpperCase()
                      }
                    >
                      {backgroundImage
                        ? "Image Selected"
                        : backgroundColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              {/* Custom Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tuỳ chỉnh màu
                </span>
                <ColorPicker
                  showText
                  className="h-9 bg-white border-slate-200"
                  value={backgroundColor}
                  onChange={(color) => setBackgroundColor(color.toHexString())}
                />
              </div>

              {/* Default Colors */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Màu nền mặc định
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <Tooltip key={color} title={color}>
                      <button
                        onClick={() => setBackgroundColor(color)}
                        className={cn(
                          "w-full aspect-square rounded-full border transition-all relative group",
                          backgroundColor === color
                            ? "border-primary scale-110 shadow-md"
                            : "border-gray-200 hover:scale-105",
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {backgroundColor === color && (
                          <RiCheckLine
                            className="absolute inset-0 m-auto text-white drop-shadow-sm"
                            size={14}
                          />
                        )}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Gradients */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Màu nền Gradient
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENTS.map((grad, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBackgroundColor(grad)}
                      className={cn(
                        "w-full aspect-square rounded-full border transition-all relative overflow-hidden group",
                        backgroundColor === grad
                          ? "border-primary scale-105 shadow-md"
                          : "border-gray-200 hover:border-slate-200",
                      )}
                      style={{ background: grad }}
                    >
                      {backgroundColor === grad && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <RiCheckLine className="text-white" size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
                </div>
              ),
            },
            {
              key: "image",
              label: "Hình nền",
              icon: <RiImageLine size={16} />,
              content: (
                <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Spin size="small" />
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => void openUploadedImagesModal()}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors",
                        "bg-white text-slate-600 border-slate-200 hover:border-primary/20 hover:text-primary",
                      )}
                    >
                      <RiImageAddLine size={16} />
                      Ảnh đã tải lên
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kho hình nền có sẵn
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {stockBackgrounds.map((asset) => (
                      <button
                        key={asset.key}
                        onClick={() => setBackgroundImage(asset.url)}
                        className={cn(
                          "aspect-square rounded-xl border-2 transition-all relative overflow-hidden group",
                          backgroundImage === asset.url
                            ? "border-primary scale-105 shadow-md"
                            : "border-gray-200 hover:border-slate-200",
                        )}
                      >
                        <img
                          src={asset.url}
                          className="w-full h-full object-cover"
                          alt={asset.name}
                        />
                        {backgroundImage === asset.url && (
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

                  {stockBackgrounds.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">
                      Không có hình nền
                    </div>
                  )}

                  <div ref={loadMoreRef} className="h-6" />

                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <Spin size="small" />
                    </div>
                  )}
                </div>
              )}
                </div>
              ),
            },
          ]}
        />
      </div>

      <TemplateThumbnailModal
        open={isUploadedImagesModalOpen}
        uploadedImages={uploadedImages}
        loadingUploadedImages={loadingUploadedImages}
        uploadingImage={uploadingImage}
        selectedUrl={backgroundImage}
        title="Chọn hình nền đã tải lên"
        emptyDescription="Tải ảnh lên ngay để dùng làm hình nền"
        onCancel={() => setIsUploadedImagesModalOpen(false)}
        onRefresh={() => {
          void loadUploadedImages();
        }}
        onUpload={(file) => {
          void handleBackgroundUpload(file);
        }}
        onSelect={(url) => {
          setBackgroundImage(url);
          setIsUploadedImagesModalOpen(false);
        }}
      />
    </div>
  );
}
