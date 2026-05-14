export type GuideOrientation = "horizontal" | "vertical";

export type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AxisGuide = {
  id: string;
  orientation: GuideOrientation;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: "alignment" | "center";
};

export type SpacingGuide = {
  id: string;
  orientation: GuideOrientation;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  labelX: number;
  labelY: number;
};

export type SmartGuideOverlayState = {
  active: boolean;
  guides: AxisGuide[];
  spacingGuides: SpacingGuide[];
};

export type SnapAxisCandidate = {
  delta: number;
  guide: AxisGuide;
};

export type SnapResult = {
  x: number;
  y: number;
  guides: AxisGuide[];
  spacingGuides: SpacingGuide[];
};
