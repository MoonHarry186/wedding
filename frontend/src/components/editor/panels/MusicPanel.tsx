import React, { useState, useEffect, useRef } from "react";
import { Spin, Empty, Tabs, Input } from "antd";
import { 
  RiMusic2Line, 
  RiPlayFill, 
  RiPauseFill, 
  RiCheckLine, 
  RiVolumeUpLine,
  RiCloseLine,
  RiSearchLine,
  RiDeleteBin6Line,
  RiHeadphoneLine
} from "@remixicon/react";
import { mediaApi, type StockAsset } from "@/api/media.api";
import { useEditorStore } from "@/store/editor.store";
import { cn } from "@/lib/utils";

export function MusicPanel() {
  const { bgMusicUrl, setBgMusicUrl } = useEditorStore();
  const [songs, setSongs] = useState<StockAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const data = await mediaApi.stockAssets("songs");
        setSongs(data);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const togglePreview = (url: string) => {
    if (previewUrl === url) {
      audioRef.current?.pause();
      setPreviewUrl(null);
    } else {
      setPreviewUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    }
  };

  const handleSelect = (url: string) => {
    setBgMusicUrl(url === bgMusicUrl ? "" : url);
  };

  const filteredSongs = songs.filter(song => 
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSong = songs.find(s => s.url === bgMusicUrl);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <Tabs
        defaultActiveKey="library"
        className="px-4"
        items={[
          {
            key: "library",
            label: (
              <div className="flex items-center gap-2">
                <RiHeadphoneLine size={16} />
                <span>Thư viện nhạc</span>
              </div>
            ),
          },
          {
            key: "mine",
            label: (
              <div className="flex items-center gap-2">
                <RiMusic2Line size={16} />
                <span>Nhạc của tôi</span>
              </div>
            ),
          }
        ]}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pt-0">
        {/* Current Selection */}
        <section className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800">Nhạc đang chọn</h4>
          <div className={cn(
            "p-3 rounded-2xl border flex items-center gap-3 transition-all",
            bgMusicUrl 
              ? "bg-primary/5 border-primary/10" 
              : "bg-slate-50 border-slate-100 border-dashed"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              bgMusicUrl ? "bg-primary text-white shadow-sm" : "bg-slate-200 text-slate-400"
            )}>
              {bgMusicUrl ? (
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-0.5 bg-current animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ height: '60%' }} />
                  <div className="w-0.5 bg-current animate-[music-bar_1.2s_ease-in-out_infinite]" style={{ height: '100%' }} />
                  <div className="w-0.5 bg-current animate-[music-bar_0.9s_ease-in-out_infinite]" style={{ height: '80%' }} />
                </div>
              ) : (
                <RiMusic2Line size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-bold truncate",
                bgMusicUrl ? "text-primary" : "text-slate-400"
              )}>
                {selectedSong ? selectedSong.name.replace(/\.[^/.]+$/, "") : "Chưa chọn nhạc"}
              </p>
            </div>
            {bgMusicUrl && (
              <button 
                onClick={() => setBgMusicUrl("")}
                className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
              >
                <RiDeleteBin6Line size={18} />
              </button>
            )}
          </div>
        </section>

        {/* Search and Filters */}
        <div className="space-y-4">
          <Input 
            prefix={<RiSearchLine size={18} className="text-slate-400" />}
            placeholder="Nhập tên bài hát"
            className="rounded-xl h-11 border-slate-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["Tất cả", "Nhạc Quốc Tế", "Nhạc Việt"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  category === cat 
                    ? "bg-primary/5 text-primary ring-1 ring-primary/20" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spin size="small" />
              <p className="text-xs text-slate-400">Đang tải thư viện...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="py-20 text-center">
              <Empty description="Không tìm thấy bài hát nào" />
            </div>
          ) : (
            filteredSongs.map((song) => (
              <div 
                key={song.key}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-2xl transition-all group",
                  bgMusicUrl === song.url ? "bg-primary/5" : "hover:bg-slate-50"
                )}
              >
                <button
                  onClick={() => togglePreview(song.url)}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
                    previewUrl === song.url 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-primary/5 text-primary/70 hover:bg-primary/10"
                  )}
                >
                  {previewUrl === song.url ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-0.5 bg-current animate-pulse" style={{ height: '60%' }} />
                      <div className="w-0.5 bg-current animate-pulse" style={{ height: '100%' }} />
                      <div className="w-0.5 bg-current animate-pulse" style={{ height: '80%' }} />
                    </div>
                  ) : (
                    <RiPlayFill size={20} className="ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[13px] font-bold truncate",
                    bgMusicUrl === song.url ? "text-primary" : "text-slate-700"
                  )}>
                    {song.name.replace(/\.[^/.]+$/, "")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">3:41</p>
                </div>

                <button
                  onClick={() => handleSelect(song.url)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-black transition-all",
                    bgMusicUrl === song.url
                      ? "bg-primary/10 text-primary"
                      : "bg-primary text-white hover:opacity-90 shadow-sm"
                  )}
                >
                  {bgMusicUrl === song.url ? "ĐÃ CHỌN" : "CHỌN"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <audio ref={audioRef} onEnded={() => setPreviewUrl(null)} className="hidden" />

      <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
