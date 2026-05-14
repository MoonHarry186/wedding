"use client";

import React from "react";
import { Modal, Button, Tabs, Slider, InputNumber, Tooltip } from "antd";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiAspectRatioLine,
  RiShapesLine,
  RiZoomInLine,
  RiInformationLine,
} from "@remixicon/react";
import type { ImageElement, CropData } from "@/types/editor";
import { useEditorStore } from "@/store/editor.store";

// ─── Shape definitions ────────────────────────────────────────────────────────

interface ShapeDef {
  id: string;
  label: string;
  clipPath: string;
}

const SHAPES_NORMAL: ShapeDef[] = [
  { id: "none", label: "Chữ nhật", clipPath: "none" },
  { id: "rounded", label: "Bo góc", clipPath: "inset(0 round 10%)" },
  { id: "circle", label: "Elip", clipPath: "ellipse(50% 50% at 50% 50%)" },
  {
    id: "arch",
    label: "Vòm",
    clipPath:
      "polygon(0% 30%,5% 15%,15% 5%,30% 0%,50% 0%,70% 0%,85% 5%,95% 15%,100% 30%,100% 100%,0% 100%)",
  },
  {
    id: "diamond",
    label: "Thoi",
    clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
  },
  {
    id: "hexagon",
    label: "Lục giác",
    clipPath: "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
  },
  {
    id: "triangle",
    label: "Tam giác",
    clipPath: "polygon(50% 0%,100% 100%,0% 100%)",
  },
  {
    id: "parallelogram",
    label: "Bình hành",
    clipPath: "polygon(15% 0%,100% 0%,85% 100%,0% 100%)",
  },
  {
    id: "pentagon",
    label: "Ngũ giác",
    clipPath: "polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)",
  },
  {
    id: "octagon",
    label: "Bát giác",
    clipPath:
      "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
  },
  {
    id: "trapezoid",
    label: "Thang",
    clipPath: "polygon(20% 0%,80% 0%,100% 100%,0% 100%)",
  },
  {
    id: "drop",
    label: "Giọt nước",
    clipPath:
      "polygon(50% 0%,80% 35%,100% 65%,80% 90%,50% 100%,20% 90%,0% 65%,20% 35%)",
  },
];

const SHAPES_SPECIAL: ShapeDef[] = [
  {
    id: "star5",
    label: "Ngôi sao",
    clipPath:
      "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
  },
  {
    id: "arrow-right",
    label: "Mũi tên",
    clipPath: "polygon(0% 15%,60% 15%,60% 0%,100% 50%,60% 100%,60% 85%,0% 85%)",
  },
  {
    id: "chevron",
    label: "Tên chỉ",
    clipPath: "polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)",
  },
  {
    id: "cross",
    label: "Chữ thập",
    clipPath:
      "polygon(35% 0%,65% 0%,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0% 65%,0% 35%,35% 35%)",
  },
  {
    id: "message",
    label: "Tin nhắn",
    clipPath: "polygon(0% 0%,100% 0%,100% 72%,65% 72%,55% 100%,45% 72%,0% 72%)",
  },
  {
    id: "ribbon",
    label: "Ribbon",
    clipPath: "polygon(0% 0%,100% 0%,100% 72%,60% 72%,50% 100%,40% 72%,0% 72%)",
  },
  {
    id: "badge",
    label: "Huy hiệu",
    clipPath:
      "polygon(50% 0%,63% 12%,79% 9%,85% 25%,100% 30%,96% 47%,100% 62%,84% 67%,79% 83%,63% 81%,50% 93%,37% 81%,21% 83%,16% 67%,0% 62%,4% 47%,0% 30%,15% 25%,21% 9%,37% 12%)",
  },
  {
    id: "arrow-down",
    label: "Trỏ xuống",
    clipPath: "polygon(0% 0%,100% 0%,100% 60%,50% 100%,0% 60%)",
  },
  {
    id: "pac",
    label: "Khuyết góc",
    clipPath: "polygon(100% 0%,75% 50%,100% 100%,0% 100%,0% 0%)",
  },
  { id: "frame-rounded", label: "Bo to", clipPath: "inset(0 round 50% 10%)" },
  {
    id: "wave",
    label: "Lá cờ",
    clipPath:
      "polygon(0% 0%,100% 0%,100% 70%,90% 60%,80% 70%,70% 60%,60% 70%,50% 60%,40% 70%,30% 60%,20% 70%,10% 60%,0% 70%)",
  },
  {
    id: "shield",
    label: "Khiên",
    clipPath: "polygon(50% 0%,100% 20%,100% 65%,50% 100%,0% 65%,0% 20%)",
  },
];

const ALL_SHAPES = [...SHAPES_NORMAL, ...SHAPES_SPECIAL];

// ─── Aspect ratios ────────────────────────────────────────────────────────────

const ASPECT_RATIOS = [
  { label: "Tự do", value: null },
  { label: "1:1", value: 1 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type HandleType = "move" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DragState {
  handle: HandleType;
  startClientX: number;
  startClientY: number;
  startBox: CropBox;
}

interface Props {
  element: ImageElement;
  open: boolean;
  onClose: () => void;
}

const MIN_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EPSILON = 0.5;
const nearlyEqual = (a: number, b: number) => Math.abs(a - b) < EPSILON;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ─── ShapeThumb ───────────────────────────────────────────────────────────────

function ShapeThumb({
  shape,
  selected,
  onClick,
}: {
  shape: ShapeDef;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip title={shape.label} mouseEnterDelay={0.5}>
      <button
        onClick={onClick}
        className={`w-full aspect-square rounded-xl transition-all overflow-hidden border-2 flex items-center justify-center p-1.5 ${
          selected
            ? "border-primary bg-primary/5"
            : "border-slate-100 hover:border-slate-300 bg-slate-50/50"
        }`}
      >
        <div
          className={`w-full h-full transition-colors ${selected ? "bg-primary" : "bg-slate-400"}`}
          style={{
            clipPath: shape.clipPath !== "none" ? shape.clipPath : undefined,
          }}
        />
      </button>
    </Tooltip>
  );
}

// Helper to render SVG shape based on CSS clipPath string
const renderShapeSVG = (
  shapeId: string,
  box: CropBox,
  fill: string = "black",
) => {
  const shape = ALL_SHAPES.find((s) => s.id === shapeId);
  if (!shape || shape.clipPath === "none") {
    return (
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={fill} />
    );
  }

  const cp = shape.clipPath;

  if (cp.startsWith("polygon")) {
    const points = cp
      .replace("polygon(", "")
      .replace(")", "")
      .split(",")
      .map((p) => {
        const parts = p.trim().split(/\s+/);
        const xPercent = parseFloat(parts[0]) / 100;
        const yPercent = parseFloat(parts[1]) / 100;
        return `${box.x + xPercent * box.w},${box.y + yPercent * box.h}`;
      })
      .join(" ");
    return <polygon points={points} fill={fill} />;
  }

  if (cp.startsWith("ellipse")) {
    return (
      <ellipse
        cx={box.x + box.w / 2}
        cy={box.y + box.h / 2}
        rx={box.w / 2}
        ry={box.h / 2}
        fill={fill}
      />
    );
  }

  if (cp.startsWith("inset")) {
    // Basic support for inset(0 round X%)
    let rx = 0;
    if (cp.includes("round")) {
      const match = cp.match(/round\s+(\d+)%/);
      if (match) rx = (parseFloat(match[1]) / 100) * Math.min(box.w, box.h);
    }
    return (
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={rx}
        ry={rx}
        fill={fill}
      />
    );
  }

  return <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={fill} />;
};

// ─── CropModal ────────────────────────────────────────────────────────────────

export function CropModal({ element, open, onClose }: Props) {
  const { updateElement, pushHistory } = useEditorStore();

  // Display rect of the image within the preview container (px, relative to container)
  const [imgDisplayRect, setImgDisplayRect] = React.useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [cropBox, setCropBox] = React.useState<CropBox>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);
  const [selectedClipShape, setSelectedClipShape] = React.useState<string>(
    ALL_SHAPES.find((s) => s.clipPath === element.clipShape)?.id ?? "none",
  );
  const [shapeTab, setShapeTab] = React.useState<"normal" | "special">(
    "normal",
  );
  const [imgLoaded, setImgLoaded] = React.useState(false);

  // Zoom & Pan for the preview
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const dragging = React.useRef<DragState | null>(null);
  const isPanning = React.useRef(false);
  const [isDraggingPan, setIsDraggingPan] = React.useState(false);

  // Tính toán vùng hiển thị của ảnh (letterbox) bên trong container preview

  // Tính toán vùng hiển thị của ảnh (letterbox) bên trong container preview
  const computeDisplayRect = React.useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth) return null;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imgAspect = iw / ih;
    const containerAspect = cw / ch;

    let dw: number, dh: number, dx: number, dy: number;
    if (imgAspect > containerAspect) {
      // Ảnh rộng hơn container -> fit theo chiều rộng
      dw = cw;
      dh = cw / imgAspect;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      // Ảnh cao hơn container -> fit theo chiều cao
      dh = ch;
      dw = ch * imgAspect;
      dx = (cw - dw) / 2;
      dy = 0;
    }
    return { x: dx, y: dy, w: dw, h: dh };
  }, []);

  // Khởi tạo vùng crop khi mở modal hoặc load xong ảnh
  const initCrop = React.useCallback(() => {
    const rect = computeDisplayRect();
    if (!rect) return;
    setImgDisplayRect(rect);

    // Reset zoom & pan to ensure initial cropBox placement matches zoom=1
    setZoom(1);
    setPan({ x: 0, y: 0 });

    // Phục hồi dữ liệu crop cũ nếu có, nếu không thì mặc định chọn toàn bộ ảnh
    const existing = element.cropData;
    if (existing) {
      setCropBox({
        x: rect.x + existing.x * rect.w,
        y: rect.y + existing.y * rect.h,
        w: existing.width * rect.w,
        h: existing.height * rect.h,
      });
    } else {
      setCropBox({ x: rect.x, y: rect.y, w: rect.w, h: rect.h });
    }
    setSelectedClipShape(
      ALL_SHAPES.find((s) => s.clipPath === element.clipShape)?.id ?? "none",
    );
  }, [computeDisplayRect, element.cropData, element.clipShape]);

  const handleImgLoad = React.useCallback(() => {
    setImgLoaded(true);
    initCrop();
  }, [initCrop]);

  // Re-init if element changes while modal is open
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open && imgLoaded) initCrop();
  }, [open, imgLoaded, initCrop]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setImgLoaded(false);
  }, [open]);

  // ── Logic Zoom & Pan ────────────────────────────────────────────────────────

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = 1.1;
    const newZoom = delta > 0 ? zoom * factor : zoom / factor;
    const clampedZoom = Math.max(1, Math.min(20, newZoom));

    if (clampedZoom === zoom) return;

    // Zoom hướng về vị trí chuột
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const ratio = clampedZoom / zoom;
      const newPanX = mouseX - (mouseX - pan.x) * ratio;
      const newPanY = mouseY - (mouseY - pan.y) * ratio;

      setZoom(clampedZoom);

      // Nếu zoom về 1, reset pan về 0
      const nextPan =
        clampedZoom <= 1 ? { x: 0, y: 0 } : { x: newPanX, y: newPanY };
      setPan(nextPan);

      // QUAN TRỌNG: Re-constrain cropBox ngay lập tức khi zoom thay đổi
      // Chúng ta sử dụng giá trị zoom và pan mới để tính toán
      setCropBox((prev) => {
        const iw = imgDisplayRect.w * clampedZoom;
        const ih = imgDisplayRect.h * clampedZoom;
        const ix = imgDisplayRect.x * clampedZoom + nextPan.x;
        const iy = imgDisplayRect.y * clampedZoom + nextPan.y;

        let { x, y, w, h } = prev;
        w = Math.max(MIN_SIZE, Math.min(iw, w));
        h = Math.max(MIN_SIZE, Math.min(ih, h));
        x = Math.max(ix, Math.min(ix + iw - w, x));
        y = Math.max(iy, Math.min(iy + ih - h, y));
        return { x, y, w, h };
      });
    }
  };

  const startPan = (e: React.PointerEvent) => {
    // Cho phép pan khi click vào vùng ảnh (ngoài crop box) và zoom > 1
    if (e.button !== 0 || zoom <= 1) return;
    isPanning.current = true;
    setIsDraggingPan(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = {
      handle: "move",
      startClientX: e.clientX,
      startClientY: e.clientY,
      startBox: { x: pan.x, y: pan.y, w: 0, h: 0 },
    };
  };

  // ── Pointer drag logic ──────────────────────────────────────────────────────

  // Đảm bảo khung crop luôn nằm trong phạm vi ảnh hiển thị hiện tại
  const constrainBox = React.useCallback(
    (box: CropBox): CropBox => {
      let { x, y, w, h } = box;

      // Vùng ảnh thực tế trên màn hình (px)
      const iw = imgDisplayRect.w * zoom;
      const ih = imgDisplayRect.h * zoom;
      const ix = imgDisplayRect.x * zoom + pan.x;
      const iy = imgDisplayRect.y * zoom + pan.y;

      // 1. Giới hạn kích thước tối thiểu và không vượt quá kích thước ảnh
      w = Math.max(MIN_SIZE, Math.min(iw, w));
      h = Math.max(MIN_SIZE, Math.min(ih, h));

      // 2. Đảm bảo x, y nằm trong biên ảnh
      x = Math.max(ix, Math.min(ix + iw - w, x));
      y = Math.max(iy, Math.min(iy + ih - h, y));

      return { x, y, w, h };
    },
    [imgDisplayRect, zoom, pan],
  );

  // Áp dụng tỉ lệ khung hình (Aspect Ratio) khi kéo resize
  const applyAspectRatio = React.useCallback(
    (box: CropBox, ar: number | null, handle: HandleType): CropBox => {
      if (!ar) return box;
      // Điều chỉnh chiều rộng hoặc chiều cao tùy theo handle đang kéo
      if (handle === "n" || handle === "s") {
        return { ...box, w: box.h * ar };
      }
      return { ...box, h: box.w / ar };
    },
    [],
  );

  const startDrag = React.useCallback(
    (handle: HandleType) => (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = {
        handle,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startBox: { ...cropBox },
      };
    },
    [cropBox],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const d = dragging.current;
      if (!d) return;

      const dx = e.clientX - d.startClientX;
      const dy = e.clientY - d.startClientY;

      if (isPanning.current) {
        let newPanX = d.startBox.x + dx;
        let newPanY = d.startBox.y + dy;

        // Ràng buộc Pan: Ảnh phải luôn bao phủ CropBox
        // ix = imgDisplayRect.x * zoom + panX
        // ix <= cropBox.x  =>  panX <= cropBox.x - imgDisplayRect.x * zoom
        // ix + iw >= cropBox.x + cropBox.w  =>  panX >= (cropBox.x + cropBox.w) - (imgDisplayRect.x + imgDisplayRect.w) * zoom

        const maxPanX = cropBox.x - imgDisplayRect.x * zoom;
        const minPanX =
          cropBox.x + cropBox.w - (imgDisplayRect.x + imgDisplayRect.w) * zoom;
        const maxPanY = cropBox.y - imgDisplayRect.y * zoom;
        const minPanY =
          cropBox.y + cropBox.h - (imgDisplayRect.y + imgDisplayRect.h) * zoom;

        newPanX = Math.max(minPanX, Math.min(maxPanX, newPanX));
        newPanY = Math.max(minPanY, Math.min(maxPanY, newPanY));

        const nextPan = { x: newPanX, y: newPanY };
        setPan(nextPan);

        // Khi pan ảnh, nếu ảnh bị kéo đi làm crop box lọt ra ngoài, chúng ta phải đẩy crop box vào
        setCropBox((prev) => {
          const iw = imgDisplayRect.w * zoom;
          const ih = imgDisplayRect.h * zoom;
          const ix = imgDisplayRect.x * zoom + nextPan.x;
          const iy = imgDisplayRect.y * zoom + nextPan.y;

          let { x, y } = prev;
          const { w, h } = prev;
          x = Math.max(ix, Math.min(ix + iw - w, x));
          y = Math.max(iy, Math.min(iy + ih - h, y));
          return { x, y, w, h };
        });
        return;
      }

      const sb = d.startBox;
      let next: CropBox = { ...sb };

      switch (d.handle) {
        case "move":
          next = { ...sb, x: sb.x + dx, y: sb.y + dy };
          break;
        case "nw":
          next = { x: sb.x + dx, y: sb.y + dy, w: sb.w - dx, h: sb.h - dy };
          break;
        case "n":
          next = { ...sb, y: sb.y + dy, h: sb.h - dy };
          break;
        case "ne":
          next = { ...sb, y: sb.y + dy, w: sb.w + dx, h: sb.h - dy };
          break;
        case "e":
          next = { ...sb, w: sb.w + dx };
          break;
        case "se":
          next = { ...sb, w: sb.w + dx, h: sb.h + dy };
          break;
        case "s":
          next = { ...sb, h: sb.h + dy };
          break;
        case "sw":
          next = { x: sb.x + dx, y: sb.y, w: sb.w - dx, h: sb.h + dy };
          break;
        case "w":
          next = { x: sb.x + dx, y: sb.y, w: sb.w - dx, h: sb.h };
          break;
      }

      if (d.handle !== "move") {
        next = applyAspectRatio(next, aspectRatio, d.handle);
      }

      next = constrainBox(next);
      setCropBox(next);
    },
    [
      aspectRatio,
      applyAspectRatio,
      constrainBox,
      imgDisplayRect,
      zoom,
      pan,
      cropBox.x,
      cropBox.y,
      cropBox.w,
      cropBox.h,
    ],
  );

  const handlePointerUp = React.useCallback(() => {
    dragging.current = null;
    isPanning.current = false;
    setIsDraggingPan(false);
  }, []);

  // ── Aspect ratio change ─────────────────────────────────────────────────────

  const handleAspectChange = (ar: number | null) => {
    setAspectRatio(ar);
    if (!ar) return;
    // Snap current crop to new ratio keeping top-left and width fixed
    setCropBox((prev) => {
      const next = constrainBox({ ...prev, h: prev.w / ar });
      return next;
    });
  };

  // ── Confirm / Reset ─────────────────────────────────────────────────────────

  const handleConfirm = () => {
    // 1. Kiểm tra tính hợp lệ: Nếu vùng crop hoặc ảnh không có kích thước thì đóng modal
    if (
      cropBox.w <= 0 ||
      cropBox.h <= 0 ||
      !imgDisplayRect.w ||
      !imgDisplayRect.h
    ) {
      onClose();
      return;
    }

    // 2. Tính toán kích thước và vị trí của ảnh trong modal (đã tính cả zoom và pan)
    const currentImgW = imgDisplayRect.w * zoom;
    const currentImgH = imgDisplayRect.h * zoom;
    const currentImgX = imgDisplayRect.x * zoom + pan.x;
    const currentImgY = imgDisplayRect.y * zoom + pan.y;

    // Tính toán tọa độ tương đối (từ 0 đến 1) của khung crop so với ảnh gốc
    const relX = (cropBox.x - currentImgX) / currentImgW;
    const relY = (cropBox.y - currentImgY) / currentImgH;
    const relW = cropBox.w / currentImgW;
    const relH = cropBox.h / currentImgH;

    // Kiểm tra xem người dùng có đang chọn toàn bộ ảnh hay không (sử dụng sai số cực nhỏ cho tỉ lệ 0..1)
    const RATIO_EPSILON = 0.001;
    const isFull =
      Math.abs(relX) < RATIO_EPSILON &&
      Math.abs(relY) < RATIO_EPSILON &&
      Math.abs(relW - 1) < RATIO_EPSILON &&
      Math.abs(relH - 1) < RATIO_EPSILON;

    // Tạo dữ liệu crop mới, nếu chọn toàn bộ thì để undefined
    const newCropData: CropData | undefined = isFull
      ? undefined
      : {
          x: clamp01(relX),
          y: clamp01(relY),
          width: clamp01(relW),
          height: clamp01(relH),
        };

    // Tìm đường dẫn clipShape tương ứng nếu có chọn hình dạng
    const clipShapePath = ALL_SHAPES.find(
      (s) => s.id === selectedClipShape,
    )?.clipPath;

    // 3. Tính toán kích thước mới và vị trí ổn định trên canvas
    const currentCropW = element.cropData?.width || 1;
    const currentCropH = element.cropData?.height || 1;
    const currentCropX = element.cropData?.x || 0;
    const currentCropY = element.cropData?.y || 0;

    // Chiều rộng/chiều cao của ảnh "toàn phần" nếu không bị crop trên canvas
    const fullImageCanvasW = element.width / currentCropW;
    const fullImageCanvasH = element.height / currentCropH;

    // Tính toán tỉ lệ scale từ modal pixel sang canvas pixel
    // Chúng ta dùng pxScaleX làm chuẩn để tránh làm méo ảnh (distort)
    const pxScale = fullImageCanvasW / imgDisplayRect.w;

    // Kích thước mới của element trên canvas (phải khớp với tỉ lệ cropBox)
    const newWidth = (cropBox.w / zoom) * pxScale;
    const newHeight = (cropBox.h / zoom) * pxScale;

    // Để ảnh "đứng yên" tại vị trí cũ, chúng ta tính vị trí Top-Left của ảnh gốc trên canvas
    const fullImageCanvasX = element.x - currentCropX * fullImageCanvasW;
    const fullImageCanvasY = element.y - currentCropY * fullImageCanvasH;

    // Từ đó tính ra vị trí Top-Left mới của element sau khi crop
    const newX = fullImageCanvasX + relX * fullImageCanvasW;
    const newY = fullImageCanvasY + relY * fullImageCanvasH;

    // Lưu vào lịch sử và cập nhật element
    pushHistory("Cắt ảnh");
    updateElement(element.id, {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
      x: Math.round(newX),
      y: Math.round(newY),
      cropData: newCropData,
      clipShape:
        clipShapePath && clipShapePath !== "none" ? clipShapePath : undefined,
    });

    onClose();
  };

  const handleReset = () => {
    setCropBox({ x: 0, y: 0, w: imgDisplayRect.w, h: imgDisplayRect.h });
    setSelectedClipShape("none");
    setAspectRatio(null);
  };

  // ── Handles layout ──────────────────────────────────────────────────────────

  const HANDLE_DEFS: {
    handle: HandleType;
    style: React.CSSProperties;
    cursor: string;
  }[] = [
    { handle: "nw", style: { top: -5, left: -5 }, cursor: "nw-resize" },
    {
      handle: "n",
      style: { top: -5, left: "50%", transform: "translateX(-50%)" },
      cursor: "n-resize",
    },
    { handle: "ne", style: { top: -5, right: -5 }, cursor: "ne-resize" },
    {
      handle: "e",
      style: { top: "50%", right: -5, transform: "translateY(-50%)" },
      cursor: "e-resize",
    },
    { handle: "se", style: { bottom: -5, right: -5 }, cursor: "se-resize" },
    {
      handle: "s",
      style: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
      cursor: "s-resize",
    },
    { handle: "sw", style: { bottom: -5, left: -5 }, cursor: "sw-resize" },
    {
      handle: "w",
      style: { top: "50%", left: -5, transform: "translateY(-50%)" },
      cursor: "w-resize",
    },
  ];

  // Current shape clip-path for live preview
  const currentClipPath =
    ALL_SHAPES.find((s) => s.id === selectedClipShape)?.clipPath ?? "none";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <RiAspectRatioLine size={20} className="text-primary" />
          <span className="font-bold text-slate-800 text-base">
            Cắt & Tạo hình ảnh
          </span>
        </div>
      }
      width={940}
      footer={null}
      centered
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex" style={{ height: 600 }}>
        {/* ── Left: image preview ── */}
        <div
          className={`flex-1 bg-[#1a1c1e] relative overflow-hidden transition-all select-none ${
            isDraggingPan
              ? "cursor-grabbing"
              : zoom > 1
                ? "cursor-grab"
                : "cursor-default"
          }`}
          ref={containerRef}
          onWheel={handleWheel}
          onPointerDown={startPan}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Wrapper for zoom/pan */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={element.url}
              alt="crop preview"
              className="absolute"
              style={{
                left: imgDisplayRect.x,
                top: imgDisplayRect.y,
                width: imgDisplayRect.w,
                height: imgDisplayRect.h,
                objectFit: "fill",
              }}
              onLoad={handleImgLoad}
              draggable={false}
            />
          </div>

          {/* Overlay layer: dark mask + crop handles (OUTSIDE zoom wrapper) */}
          {imgLoaded && (
            <div className="absolute inset-0 pointer-events-auto">
              {/* Dark outside-crop mask */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height="100%"
              >
                <defs>
                  <mask id="crop-hole">
                    <rect width="100%" height="100%" fill="white" />
                    {renderShapeSVG(selectedClipShape, cropBox, "black")}
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="black"
                  fillOpacity={0.55}
                  mask="url(#crop-hole)"
                />
              </svg>

              {/* Crop box container */}
              <div
                className="absolute"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.w,
                  height: cropBox.h,
                }}
              >
                {/* Visual border for the shape */}
                {selectedClipShape !== "none" && (
                  <div
                    className="absolute inset-0 border-[3px] border-primary pointer-events-none z-10 opacity-70"
                    style={{ clipPath: currentClipPath }}
                  />
                )}

                {/* Main crop box with handles */}
                <div
                  className="absolute inset-0 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] cursor-move"
                  onPointerDown={startDrag("move")}
                >
                  {/* Rule-of-thirds grid */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gridTemplateRows: "1fr 1fr 1fr",
                    }}
                  >
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-white/30" />
                    ))}
                  </div>
                </div>

                {/* Resize handles */}
                {HANDLE_DEFS.map(({ handle, style, cursor }) => (
                  <div
                    key={handle}
                    className="absolute w-3.5 h-3.5 bg-white border-2 border-primary rounded-full shadow-lg hover:scale-125 transition-transform"
                    style={{ ...style, cursor, zIndex: 20 }}
                    onPointerDown={startDrag(handle)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Zoom Level Indicator */}
          {zoom > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-[11px] font-bold">
              Độ phóng đại: {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* ── Right: controls ── */}
        <div className="w-72 flex flex-col bg-white border-l border-slate-100 overflow-hidden px-4">
          <div className="flex-1 overflow-y-auto">
            <Tabs
              defaultActiveKey="crop"
              className="px-4 editor-tabs-custom"
              items={[
                {
                  key: "crop",
                  label: (
                    <div className="flex items-center gap-2">
                      <RiAspectRatioLine size={16} />
                      <span>Cắt ảnh</span>
                    </div>
                  ),
                  children: (
                    <div className="py-4 space-y-6">
                      {/* Zoom control */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <RiZoomInLine size={14} />
                            Phóng đại ảnh
                          </label>
                          <span className="text-[11px] font-bold text-primary">
                            {Math.round(zoom * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={1}
                            max={10}
                            step={0.1}
                            value={zoom}
                            onChange={(v) => {
                              const ratio = v / zoom;
                              const rect =
                                containerRef.current?.getBoundingClientRect();
                              if (rect) {
                                const mouseX = rect.width / 2;
                                const mouseY = rect.height / 2;
                                const newPanX =
                                  mouseX - (mouseX - pan.x) * ratio;
                                const newPanY =
                                  mouseY - (mouseY - pan.y) * ratio;
                                setZoom(v);
                                setPan(
                                  v <= 1
                                    ? { x: 0, y: 0 }
                                    : { x: newPanX, y: newPanY },
                                );
                              }
                            }}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="w-full h-px bg-slate-100" />

                      {/* Aspect ratio */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Tỉ lệ khung cắt
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {ASPECT_RATIOS.map((ar) => (
                            <button
                              key={ar.label}
                              onClick={() => handleAspectChange(ar.value)}
                              className={`py-2 px-3 rounded-xl text-[12px] font-bold border transition-all flex flex-col items-center gap-1 ${
                                aspectRatio === ar.value
                                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-primary/20 hover:bg-primary/5"
                              }`}
                            >
                              {ar.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-2">
                          <RiInformationLine
                            size={16}
                            className="text-slate-400 shrink-0 mt-0.5"
                          />
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Dùng con trỏ chuột để di chuyển khung cắt. Lăn chuột
                            để phóng to/thu nhỏ ảnh khi đang cắt.
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "shape",
                  label: (
                    <div className="flex items-center gap-2">
                      <RiShapesLine size={16} />
                      <span>Hình dạng</span>
                    </div>
                  ),
                  children: (
                    <div className="py-4 space-y-6">
                      <div>
                        <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
                          {(["normal", "special"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setShapeTab(tab)}
                              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                                shapeTab === tab
                                  ? "bg-white text-slate-800 shadow-sm"
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {tab === "normal" ? "Cơ bản" : "Nghệ thuật"}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
                          {(shapeTab === "normal"
                            ? SHAPES_NORMAL
                            : SHAPES_SPECIAL
                          ).map((shape) => (
                            <ShapeThumb
                              key={shape.id}
                              shape={shape}
                              selected={selectedClipShape === shape.id}
                              onClick={() => setSelectedClipShape(shape.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Footer buttons */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2.5">
            <Button
              block
              type="text"
              icon={<RiDeleteBinLine size={16} />}
              onClick={handleReset}
              className="h-10 text-[13px] font-semibold text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl"
            >
              Đặt lại mặc định
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                className="flex-1 h-11 text-[13px] font-bold rounded-xl border-slate-200 hover:border-primary/30"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<RiCheckLine size={18} />}
                onClick={handleConfirm}
                className="flex-[1.5] h-11 text-[13px] font-bold rounded-xl !bg-primary !border-primary shadow-lg shadow-primary/20"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
