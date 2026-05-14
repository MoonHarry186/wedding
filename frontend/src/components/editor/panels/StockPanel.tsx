"use client";

import React from "react";
import { Spin } from "antd";
import { RiArrowLeftLine, RiImageLine } from "@remixicon/react";
import { mediaApi, type StockAsset } from "@/api/media.api";
import { useEditorStore } from "@/store/editor.store";

export function StockPanel() {
  const { addElement } = useEditorStore();

  const [categories, setCategories] = React.useState<string[]>([]);
  const [loadingCats, setLoadingCats] = React.useState(true);

  const [selectedCat, setSelectedCat] = React.useState<string | null>(null);
  const [assets, setAssets] = React.useState<StockAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = React.useState(false);

  React.useEffect(() => {
    mediaApi
      .stockCategories()
      .then(setCategories)
      .finally(() => setLoadingCats(false));
  }, []);

  const openCategory = async (cat: string) => {
    setSelectedCat(cat);
    setAssets([]);
    setLoadingAssets(true);
    try {
      const data = await mediaApi.stockAssets(cat);
      setAssets(data);
    } finally {
      setLoadingAssets(false);
    }
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

  const addToCanvas = async (asset: StockAsset) => {
    const dims = await getImageDimensions(asset.url);
    addElement("image", undefined, { url: asset.url, ...dims });
  };

  if (loadingCats) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="small" />
      </div>
    );
  }

  if (selectedCat) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setSelectedCat(null)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
        >
          <RiArrowLeftLine size={14} />
          Quay lại
        </button>

        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {selectedCat}
        </p>

        {loadingAssets ? (
          <div className="flex justify-center py-8">
            <Spin size="small" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-slate-300">
            <RiImageLine size={32} className="mb-2" />
            <p className="text-xs">Không có ảnh</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {assets.map((asset) => (
              <button
                key={asset.key}
                onClick={() => addToCanvas(asset)}
                className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-transparent hover:border-primary transition-all"
                title={asset.name}
              >
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Danh mục Stock
      </p>
      {categories
        .filter((cat) => !["background", "nền", "hình nền"].includes(cat.toLowerCase()))
        .map((cat) => (
          <button
            key={cat}
            onClick={() => openCategory(cat)}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors border border-slate-100 hover:border-primary/20"
          >
            {cat}
          </button>
        ))}
    </div>
  );
}
