# Editor Code Review Report V4

Ngày review: 2026-05-13

## Phạm vi

Review lại trạng thái hiện tại của frontend/editor:

- `src/app/editor/[id]/page.tsx`
- `src/components/editor/**`
- `src/hooks/useEditorShortcuts.ts`
- `src/hooks/useMarqueeSelection.ts`
- `src/store/editor.store.ts`
- `src/types/editor.ts`
- `src/api/media.api.ts`, `src/api/templates.api.ts`

Các lệnh đã chạy:

```bash
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npx tsc --noEmit
npm run build
```

Ghi chú: `npm run build` trong sandbox bị Turbopack panic do bị chặn bind port. Đã chạy lại ngoài sandbox; build compile thành công và fail ở bước TypeScript.

## Tóm Tắt V4

So với V3, lint đã tốt hơn đáng kể nhưng type-check editor đang bị regression do refactor `CanvasData` và widget typing chưa hoàn tất.

Kết quả hiện tại:

- `lint`: 10 errors, 76 warnings. V3 là 16 errors, 90 warnings.
- `tsc --noEmit`: fail với nhiều lỗi editor mới, chủ yếu do thiếu import `CanvasData`, mismatch backup shape, và widget config union không được narrow đúng ở panel.
- `build` ngoài sandbox: compile thành công, fail type-check ở lỗi ngoài editor `dashboard/templates/categories/page.tsx:124` vì `iconUrl: string | null` không khớp `string | undefined`.

Điểm đã cải thiện:

- `CropModal.tsx:621` không còn xuất hiện trong `tsc` output, tức lỗi P0 từ V3 đã được xử lý.
- Lỗi `CanvasRenderer` không còn chặn build.
- Số lint errors giảm từ 16 xuống 10.

Điểm đang xấu đi:

- `CanvasData` được đưa vào store/page nhưng chưa import type, gây lỗi `Cannot find name 'CanvasData'`.
- Backup shape trong store vẫn khai báo kiểu cũ ở một số nơi nhưng implementation đã chuyển sang `canvasData`.
- Widget config đã được type hoá bước đầu, nhưng panel/component chưa narrow theo `widgetType`, dẫn tới hàng loạt lỗi `Property X does not exist on type ...`.

## Findings Ưu Tiên

### P0 - `CanvasData` được dùng nhưng chưa import ở `EditorPage` và store

Files:

- `src/app/editor/[id]/page.tsx:35`
- `src/app/editor/[id]/page.tsx:109`
- `src/store/editor.store.ts:112`
- `src/store/editor.store.ts:155`
- `src/store/editor.store.ts:257`

`CanvasData` đã được dùng trong `BackupEntry`, `setBackups`, `getCanvasData`, `setCanvasData`, nhưng import hiện tại thiếu `CanvasData`.

Ví dụ `EditorPage` hiện chỉ import:

```ts
import type { CanvasElement } from "@/types/editor";
```

Đề xuất:

```ts
import type { CanvasData, CanvasElement } from "@/types/editor";
```

Và trong `editor.store.ts`:

```ts
import type {
  CanvasData,
  CanvasElement,
  ElementType,
  GroupElement,
  TextElement,
  ImageElement,
  WidgetElement,
} from "@/types/editor";
```

### P0 - Backup type contract bị lệch sau khi chuyển sang `canvasData`

File: `src/store/editor.store.ts:60`

State `backups` vẫn khai báo shape cũ:

```ts
backups: Array<{
  id: string;
  templateId: string;
  timestamp: number;
  elements: CanvasElement[];
  canvasHeight: number;
  backgroundColor?: string;
  backgroundImage?: string;
}>;
```

Nhưng `setBackups` và `addBackup` đang dùng shape mới:

```ts
{
  id,
  templateId,
  timestamp,
  canvasData: getCanvasData(),
}
```

Hệ quả từ `tsc`:

```text
Type '{ id; templateId; timestamp; canvasData; }[]' is not assignable...
missing: elements, canvasHeight
```

Đề xuất:

- Tạo type chung:

```ts
interface BackupEntry {
  id: string;
  templateId: string;
  timestamp: number;
  canvasData: CanvasData;
}
```

- Dùng `BackupEntry[]` cho `backups`, `setBackups`, `EditorPage` conflict draft, localStorage parse.
- Nếu cần tương thích backup cũ, thêm migration:

```ts
function normalizeBackup(raw: unknown): BackupEntry | null
```

### P0 - `EditorPage` vẫn đọc `conflictDraft.canvasHeight` sau khi backup chuyển sang `canvasData`

File: `src/app/editor/[id]/page.tsx:283`

`BackupEntry` giờ có `canvasData`, nhưng preview height vẫn dùng:

```ts
conflictDraft?.canvasHeight
```

`tsc` báo `Property 'canvasHeight' does not exist on type 'BackupEntry'`.

Đề xuất:

```ts
conflictDraft?.canvasData?.canvasHeight
```

Đồng thời audit toàn file để không còn đọc trực tiếp `elements/canvasHeight/background...` từ backup root.

### P0 - `EditorCanvas` dùng `addElement` nhưng không destructure từ store

File: `src/components/editor/EditorCanvas.tsx:389`

`handleCanvasClick` gọi:

```ts
addElement("text", { x: ..., y: ... });
```

Nhưng destructuring từ `useEditorStore()` hiện không có `addElement`. `tsc` báo:

```text
Cannot find name 'addElement'. Did you mean 'elements'?
```

Đề xuất: thêm lại `addElement` vào destructuring nếu chức năng click-to-add-text còn dùng.

### P0 - `useEditorShortcuts` ref object thiếu `getCanvasData`

File: `src/hooks/useEditorShortcuts.ts:63`

`latestRef` initial value có `getCanvasData`, nhưng assignment trong effect thiếu field này. `tsc` báo:

```text
Property 'getCanvasData' is missing ... but required
```

Đề xuất: thêm `getCanvasData` vào object trong effect update. Đồng thời đảm bảo publish shortcut dùng `state.getCanvasData()` thay vì tự dựng canvas data.

### P1 - `PublishTemplateFn` không khớp mutation type thật

Files:

- `src/hooks/useEditorShortcuts.ts:6`
- `src/components/editor/EditorCanvas.tsx:353`

`usePublishTemplate()` trả mutation nhận:

```ts
canvasData: Record<string, unknown>
changeNote?: string
```

Nhưng `PublishTemplateFn` đang yêu cầu:

```ts
canvasData: CanvasData
changeNote: string
```

`tsc` báo `UseMutationResult` không assign được cho `PublishTemplateFn`.

Đề xuất:

- Hoặc đổi `PublishTemplateFn` theo API thật:

```ts
interface PublishTemplateFn {
  isPending: boolean;
  mutateAsync: (args: {
    id: string;
    canvasData: Record<string, unknown>;
    changeNote?: string;
  }) => Promise<unknown>;
}
```

- Hoặc chỉnh `usePublishTemplate` để nhận `CanvasData` và cast tại API boundary. Nên ưu tiên type đúng theo domain: mutation nhận `CanvasData`.

### P1 - Widget config union chưa được narrow theo panel/widgetType

Files tiêu biểu:

- `src/components/editor/EditorPropertyPanel.tsx:102`
- `src/components/editor/elements/WidgetElement.tsx:76`
- `src/components/editor/panels/CalendarPanel.tsx`
- `src/components/editor/panels/CountdownPanel.tsx`
- `src/components/editor/panels/GiftPanel.tsx`
- `src/components/editor/panels/MapPanel.tsx`
- `src/components/editor/panels/VideoPanel.tsx`

V4 đã thêm widget config interfaces trong `src/types/editor.ts`, nhưng các panel vẫn nhận `WidgetElement` tổng quát. Vì vậy TypeScript thấy `element.config` là union của mọi widget config, nên property riêng như `fullDate`, `targetDate`, `address`, `videoUrl`, `accounts` không an toàn.

Ví dụ:

```text
Property 'targetDate' does not exist on type 'CalendarWidgetConfig | CountdownWidgetConfig | ...'
```

Đề xuất:

- Mỗi panel nhận đúng element type:

```ts
interface CalendarPanelProps {
  element: CalendarWidgetElement;
  onUpdate: (updates: Partial<CalendarWidgetElement>) => void;
}
```

- Khi render panel, narrow trước:

```tsx
if (element.type === "widget" && element.widgetType === "calendar") {
  return <CalendarPanel element={element} ... />;
}
```

- Thêm fields còn thiếu vào config đúng loại, ví dụ `CalendarWidgetConfig.fullDate`, `fullDate2`, `style`; `GiftWidgetConfig.accounts`, `modalTitle`; common widget visual fields nếu dùng chung.

### P1 - `WidgetConfig` vẫn giữ `Record<string, any>`

File: `src/types/editor.ts:149`

V4 đã tạo các config interfaces nhưng vẫn để:

```ts
export type WidgetConfig =
  | CalendarWidgetConfig
  | ...
  | Record<string, any>;
```

Điều này giữ lại lint error `no-explicit-any` và làm mất lợi ích của discriminated union.

Đề xuất:

- Bỏ `Record<string, any>` khỏi union.
- Nếu cần unknown widget fallback, dùng:

```ts
interface UnknownWidgetElement extends BaseWidgetElement {
  widgetType: string;
  config: Record<string, unknown>;
}
```

Nhưng không cho unknown đi vào panel cụ thể.

### P1 - `CanvasData` đang có field không đúng kiểu domain

File: `src/types/editor.ts:211`

`CanvasData` hiện có:

```ts
boxShadow?: string;
```

Shadow của element đang dùng `ShadowSettings`, còn canvas background data không thấy dùng `boxShadow` rõ ràng.

Đề xuất:

- Nếu canvas thật sự có shadow, dùng `boxShadow?: ShadowSettings`.
- Nếu không dùng, xoá khỏi `CanvasData` để tránh schema drift.

### P2 - Lint errors còn lại chủ yếu ở panel config `any`

Lint hiện còn 10 errors:

- `CalendarPanel`: `newConfig: any`, `date: any`
- `CountdownPanel`: `newConfig: any`, `date: any`
- `GiftPanel`: `any`
- `MapPanel`: `any`
- `VideoPanel`: `any`
- `editor.store.ts`: `newBackup as any`
- `types/editor.ts`: `Record<string, any>`

Đề xuất: sau khi panel props được narrow theo widget type, thay các `any` bằng `Partial<...Config>` và date type từ `dayjs` nếu dùng Ant DatePicker.

### P2 - Lint warnings đã giảm nhưng vẫn nhiều cleanup cần làm

Warnings còn 76, giảm từ 90 ở V3. Nhóm đáng dọn:

- Unused trong `EditorPage`: `setElements`, `elements`, `canvasHeight`, `setCanvasHeight`, `activePanel`, `getCanvasData`.
- Unused trong `EditorCanvas`: `App`, `addBackup`, `canvasRef`, `textElements`.
- Unused imports trong nhiều panel.
- `<img>` warnings chưa có policy cục bộ.
- Hook dependency warnings: `TextElement`, `ImageAddPanel`, `CropModal`, `useEditorShortcuts`.

## Những Điểm Đã Cải Thiện Từ V3

- Lỗi `CropModal.tsx:621` đã biến mất khỏi `tsc`.
- `WidgetElement` bắt đầu được type hóa bằng config interfaces.
- `CanvasData` đã được mở rộng với background fields.
- Lint giảm từ 16 errors/90 warnings xuống 10 errors/76 warnings.
- Build compile thành công ngoài sandbox; lỗi hiện tại là type-check.

## Regression Mới Từ V3

- `CanvasData` thiếu import gây nhiều lỗi `Cannot find name`.
- Backup shape cũ/mới bị trộn lẫn.
- `addElement` bị bỏ khỏi destructuring nhưng vẫn dùng.
- Widget config union gây rất nhiều lỗi property access vì panel chưa narrow.
- `PublishTemplateFn` lệch với mutation type thật.

## Thứ Tự Sửa Đề Xuất Sau V4

1. Import `CanvasData` đúng nơi: `EditorPage`, `editor.store.ts`.
2. Chuẩn hóa `BackupEntry` dùng `canvasData` duy nhất và thêm migration cho backup cũ.
3. Sửa `conflictDraft?.canvasHeight` thành `conflictDraft?.canvasData?.canvasHeight`.
4. Thêm lại `addElement` vào `EditorCanvas` destructuring hoặc xoá flow click-to-add-text nếu không dùng.
5. Sửa `useEditorShortcuts` để latestRef luôn có `getCanvasData` và `PublishTemplateFn` khớp mutation thật.
6. Narrow widget panel props theo từng `widgetType`; bổ sung config fields còn thiếu.
7. Loại bỏ `Record<string, any>` khỏi `WidgetConfig`.
8. Dọn lint warnings/import thừa và policy `<img>`.
9. Sửa lỗi build ngoài editor ở `dashboard/templates/categories/page.tsx:124`.

## Acceptance Criteria

```bash
npx tsc --noEmit
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npm run build
```

Kỳ vọng trước khi merge:

- Editor không còn TypeScript error.
- Editor không còn lint error.
- Backup/restore/publish dùng cùng một `CanvasData` schema.
- Widget panels được type theo đúng `widgetType`.
- Build production không bị chặn bởi lỗi TypeScript ngoài editor.
