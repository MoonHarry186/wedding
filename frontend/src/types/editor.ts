export type ElementType = "text" | "image" | "group" | "widget";

export interface PaddingSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ShadowSettings {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  spread?: number;
}

export interface AnimationSettings {
  enabled: boolean;
  type: string;
  duration: number;
  delay: number;
  easing: string;
}

export interface BorderSettings {
  enabled: boolean;
  color: string;
  width: number;
  style: "solid" | "dashed" | "dotted" | "double";
  sides?: ("top" | "right" | "bottom" | "left")[];
  radiusTopLeft?: number;
  radiusTopRight?: number;
  radiusBottomLeft?: number;
  radiusBottomRight?: number;
}

export interface TemplateVariableSettings {
  enabled: boolean;
  key: string;
  label?: string;
  description?: string;
  required?: boolean;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  isLocked?: boolean;
  groupId?: string;
  link?: {
    url: string;
    target: "_blank" | "_self";
  };
  // Common styling
  backgroundColor?: string;
  paddingSettings?: PaddingSettings;
  border?: BorderSettings;
  animation?: AnimationSettings;
  loopAnimation?: AnimationSettings;
  templateVariable?: TemplateVariableSettings;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontWeight: string | number;
  fontFamily: string;
  color: string;
  textAlign: "left" | "center" | "right" | "justify";
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  fontStyle?: "normal" | "italic";
  writingMode?: "horizontal-tb" | "vertical-rl";
  textShadow?: ShadowSettings;
  boxShadow?: ShadowSettings;
}

export interface CropData {
  x: number; // 0–1 normalized offset from image left
  y: number; // 0–1 normalized offset from image top
  width: number; // 0–1 normalized crop width
  height: number; // 0–1 normalized crop height
}

export interface ImageElement extends BaseElement {
  type: "image";
  url: string;
  objectFit: "cover" | "contain" | "fill";
  boxShadow?: ShadowSettings;
  cropData?: CropData; // region of the image to display
  clipShape?: string; // CSS clip-path value for shape masking
}

export interface CalendarWidgetConfig {
  month: number;
  year: number;
  month2?: number;
  year2?: number;
  selectedDay?: number;
  selectedDay2?: number;
  showTwoDays?: boolean;
  activeIcon?: string | null;
  fullDate?: string;
  fullDate2?: string;
  style?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  primaryColor?: string;
  opacity?: number;
}

export interface CountdownWidgetConfig {
  targetDate: string;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  primaryColor?: string;
  layout?: "horizontal" | "vertical";
  language?: "vi" | "en";
  spacing?: number;
  fontFamily?: string;
  fontSize?: number;
  opacity?: number;
}

export interface MapWidgetConfig {
  address?: string;
  lat?: number | string;
  lng?: number | string;
  zoom?: number;
  language?: string;
  opacity?: number;
}

export interface VideoWidgetConfig {
  videoUrl: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  backgroundColor?: string;
  opacity?: number;
}

export interface BankAccount {
  id: string;
  type: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  qrImage?: string;
}

export interface GiftWidgetConfig {
  icon?: string;
  backgroundColor?: string;
  opacity?: number;
  accounts?: BankAccount[];
  modalTitle?: string;
}

export type WidgetConfig =
  | CalendarWidgetConfig
  | CountdownWidgetConfig
  | MapWidgetConfig
  | VideoWidgetConfig
  | GiftWidgetConfig;

export interface BaseWidgetElement extends BaseElement {
  type: "widget";
  boxShadow?: ShadowSettings;
}

export interface CalendarWidgetElement extends BaseWidgetElement {
  widgetType: "calendar";
  config: CalendarWidgetConfig;
}

export interface CountdownWidgetElement extends BaseWidgetElement {
  widgetType: "countdown";
  config: CountdownWidgetConfig;
}

export interface MapWidgetElement extends BaseWidgetElement {
  widgetType: "map";
  config: MapWidgetConfig;
}

export interface VideoWidgetElement extends BaseWidgetElement {
  widgetType: "video";
  config: VideoWidgetConfig;
}

export interface GiftWidgetElement extends BaseWidgetElement {
  widgetType: "qr_gift";
  config: GiftWidgetConfig;
}

export type WidgetElement =
  | CalendarWidgetElement
  | CountdownWidgetElement
  | MapWidgetElement
  | VideoWidgetElement
  | GiftWidgetElement;

export interface GroupElement extends BaseElement {
  type: "group";
  childIds: string[];
  boxShadow?: ShadowSettings;
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | GroupElement
  | WidgetElement;

export interface CanvasData {
  elements: CanvasElement[];
  canvasHeight?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  backgroundAttachment?: string;
  boxShadow?: ShadowSettings;
}

export interface BackupEntry {
  id: string;
  templateId: string;
  timestamp: number;
  canvasData: CanvasData;
  status?: "private" | "published";
}
