export interface EditorPreviewDevice {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const EDITOR_PREVIEW_DEVICES: EditorPreviewDevice[] = [
  { id: "web", label: "Web", width: 1280, height: 900 },
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-12-mini", label: "iPhone 12 mini", width: 360, height: 780 },
  { id: "iphone-14", label: "iPhone 14", width: 390, height: 844 },
  { id: "iphone-14-plus", label: "iPhone 14 Plus", width: 428, height: 926 },
  { id: "iphone-15-pro", label: "iPhone 15 Pro", width: 393, height: 852 },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", width: 430, height: 932 },
  { id: "pixel-7", label: "Pixel 7", width: 412, height: 915 },
  { id: "pixel-8-pro", label: "Pixel 8 Pro", width: 448, height: 998 },
  { id: "galaxy-s23", label: "Galaxy S23", width: 360, height: 780 },
  { id: "galaxy-a51", label: "Galaxy A51", width: 412, height: 914 },
  { id: "galaxy-s24-ultra", label: "Galaxy S24 Ultra", width: 480, height: 1067 },
];

export const DEFAULT_EDITOR_PREVIEW_DEVICE_ID = EDITOR_PREVIEW_DEVICES[0].id;
