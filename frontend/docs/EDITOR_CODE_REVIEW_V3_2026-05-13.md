# Editor Code Review Report V3

Ngày review: 2026-05-13

## Phạm vi

Review lại sau vòng sửa tiếp theo cho editor:

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

Ghi chú: lần build đầu bị Turbopack fail do sandbox chặn bind port. Đã chạy lại ngoài sandbox; build compile thành công và fail ở bước TypeScript.

## Tóm Tắt V3

V3 đã cải thiện các lỗi P0 quan trọng từ V2:

- `GroupElement` đã được thêm vào `src/types/editor.ts`.
- Store đã import đầy đủ `GroupElement`, `TextElement`, `ImageElement`, `WidgetElement`.
- `deleteBackup` đã sửa đúng sang `state.backups.filter(...)`.
- `useEditorShortcuts` đã bỏ `publishTemplate: any` và có interface `PublishTemplateFn`.
- Build không còn fail ở lỗi default/named export `CanvasRenderer`; lỗi build hiện tại là TypeScript ở khu vực dashboard ngoài editor.

Trạng thái hiện tại:

- `lint`: 16 errors, 90 warnings.
- `tsc --noEmit`: fail. Trong phạm vi editor, lỗi TypeScript còn nổi bật ở `CropModal.tsx:621`; các lỗi còn lại chủ yếu ngoài editor/dashboard.
- `build`: compile thành công, fail type-check ở `src/app/(dashboard)/dashboard/invitations/page.tsx:42` vì `tenantId` không tồn tại trên `AuthState`.

So với V2:

- Tốt hơn: các lỗi type nền tảng của editor phần lớn đã được xử lý.
- Còn tồn tại: lint errors do `any` trong preview/widget panels và lỗi `CropModal` khi gọi `constrainBox`.
- Chưa sạch: nhiều unused imports/state trong `EditorCanvas` sau refactor.

## Findings Ưu Tiên

### P0 - `CropModal` còn lỗi TypeScript chặn type-check

File: `src/components/editor/modals/CropModal.tsx:621`

`tsc` báo:

```text
Expected 1 arguments, but got 2.
```

Đoạn hiện tại:

```ts
const next = constrainBox({ ...prev, h: prev.w / ar }, imgDisplayRect);
```

Hàm `constrainBox` hiện được định nghĩa chỉ nhận 1 argument, nhưng caller truyền thêm `imgDisplayRect`. Đây là lỗi editor còn lại trong `tsc`.

Đề xuất:

- Nếu `constrainBox` đã closure qua `imgDisplayRect`, xoá argument thứ hai:

```ts
const next = constrainBox({ ...prev, h: prev.w / ar });
```

- Nếu cần rect động, đổi signature `constrainBox(box, rect)` và cập nhật mọi caller cùng lúc.

### P1 - Conflict draft preview đã sửa props nhưng còn dùng `as any`

File: `src/app/editor/[id]/page.tsx:316`

V2 lỗi sai props đã được xử lý một phần:

- `GroupElement` dùng `overrideElements`.
- `zoom={1}` đã được xoá khỏi `TextElement`/`ImageElement`.

Nhưng lint hiện báo `no-explicit-any` ở:

- `src/app/editor/[id]/page.tsx:316`
- `src/app/editor/[id]/page.tsx:329`
- `src/app/editor/[id]/page.tsx:341`

Đoạn hiện tại cast:

```tsx
element={element as any}
```

Đề xuất:

- Vì branch đã narrow bằng `element.type`, TypeScript nên infer đúng nếu `CanvasElement` union đã chuẩn. Thử bỏ `as any`.
- Nếu vẫn lỗi do component prop type quá hẹp, dùng type guard hoặc component render helper:

```ts
if (element.type === "group") {
  return <GroupElement element={element} ... />;
}
```

### P1 - Build không còn fail ở `CanvasRenderer`, nhưng vẫn bị chặn bởi TypeScript ngoài editor

File: `src/app/(dashboard)/dashboard/invitations/page.tsx:42`

Build ngoài sandbox compile thành công, sau đó fail type-check:

```text
Property 'tenantId' does not exist on type 'AuthState'.
```

Đây không phải lỗi editor, nhưng vẫn chặn `npm run build`. Các lỗi ngoài editor khác từ `tsc`:

- `dashboard/invitations`: `tenantId`, date range type `Date` vs `Dayjs`, index type.
- `dashboard/settings`: `primaryColor` không tồn tại trên `ApiTenant`.
- `dashboard/templates/categories`: `parentId` null vs undefined.
- `components/ai/GenerateTemplateTab`: `Record<string, unknown>` thiếu `elements`.

Đề xuất:

- Sửa các lỗi ngoài editor hoặc tách type-check editor riêng trong CI nếu đang cần validate editor incremental.

### P1 - `CanvasData` chưa bao phủ background settings mới

File: `src/types/editor.ts:113`

`CanvasData` hiện có:

```ts
elements: CanvasElement[];
canvasHeight?: number;
backgroundColor?: string;
backgroundImage?: string;
```

Nhưng store/canvas hiện có thêm:

- `backgroundSize`
- `backgroundRepeat`
- `backgroundPosition`
- `backgroundAttachment`

Rủi ro: publish/backup/restore có thể mất các setting nền mới.

Đề xuất:

- Mở rộng `CanvasData`:

```ts
backgroundSize?: string;
backgroundRepeat?: string;
backgroundPosition?: string;
backgroundAttachment?: string;
```

- Tạo helper `serializeCanvasData(state)` và `restoreCanvasData(canvasData)` dùng chung cho publish, backup, restore.

### P1 - `useEditorShortcuts` tốt hơn V2 nhưng vẫn còn dependency/message warning

File: `src/hooks/useEditorShortcuts.ts:269`

Đã cải thiện:

- `publishTemplate: any` đã được thay bằng `PublishTemplateFn`.

Còn lại:

- `catch (error)` không dùng `error`.
- `useEffect` thiếu dependency `message`.
- `canvasData` publish shortcut vẫn chỉ lưu `{ elements, canvasHeight }`, chưa lưu background settings mới.

Đề xuất:

- Đổi `catch (error)` thành `catch`.
- Thêm `message` vào dependency hoặc pass message API theo cách ổn định hơn.
- Dùng helper serialize canvas data thay vì inline `{ elements, canvasHeight }`.

### P1 - `EditorCanvas` vẫn còn nhiều destructure/import thừa sau refactor

File: `src/components/editor/EditorCanvas.tsx:77`

Lint vẫn báo nhiều unused:

- Icon: `RiFullscreenLine`, `RiVolumeMuteLine`, `RiArrowGoForwardLine`, `RiHome4Line`.
- Type: `TextElementType`.
- Store/action: `message`, `groupElements`, `ungroupElements`, `undo`, `redo`, `history`, `future`, `setIsDraggingOrResizing`, `addBackup`, `setDirty`, `setPreviewMode`, `deleteElements`, `duplicateElements`, `moveElements`, `setIsCropModalOpen`.
- Ref/state: `canvasRef`, `textElements`.

Đề xuất:

- Dọn unused trước khi tiếp tục refactor.
- Sau khi tách hook, component chỉ nên giữ state/action cần render canvas.

### P2 - Widget typing vẫn là nguồn lint errors lớn nhất

Files:

- `src/components/editor/elements/WidgetElement.tsx:137`
- `src/components/editor/elements/WidgetElement.tsx:235`
- `src/components/editor/elements/WidgetElement.tsx:351`
- `src/components/editor/elements/WidgetElement.tsx:382`
- `src/components/editor/elements/WidgetElement.tsx:437`
- `src/components/editor/panels/CalendarPanel.tsx:54`
- `src/components/editor/panels/CountdownPanel.tsx:31`
- `src/components/editor/panels/GiftPanel.tsx:54`
- `src/components/editor/panels/MapPanel.tsx:31`
- `src/components/editor/panels/VideoPanel.tsx:27`

`WidgetElement.config` trong `src/types/editor.ts` vẫn là `Record<string, any>` nhưng đã được suppress bằng eslint comment. Component/panel vẫn dùng `any`, nên lint còn fail.

Đề xuất:

- Tạo config interfaces theo widget:

```ts
interface CalendarWidgetConfig { ... }
interface CountdownWidgetConfig { ... }
interface MapWidgetConfig { ... }
interface VideoWidgetConfig { ... }
interface GiftWidgetConfig { ... }
```

- Chuyển `WidgetElement` thành discriminated union theo `widgetType`.

### P2 - `useMarqueeSelection` vẫn import thừa và có risk stale state

File: `src/hooks/useMarqueeSelection.ts:1`

Vẫn còn:

- `useEffect` import nhưng không dùng.
- `elements` được capture từ render hiện tại rồi dùng trong document `mousemove`.

Đề xuất:

- Xoá `useEffect`.
- Trong `onMouseMove`, lấy `useEditorStore.getState().elements` để hit-test trên state mới nhất.

### P2 - `ElementControls` còn import thừa

File: `src/components/editor/ElementControls.tsx:2`

`cn` được import nhưng không dùng.

Đề xuất: xoá import.

### P2 - Multi-selection vẫn nên dùng batch actions

File: `src/components/editor/EditorCanvas.tsx`

Nếu hiện vẫn truyền delete/duplicate từng item cho `MultiSelectionBox`, nên đổi sang batch action để tránh tạo nhiều history entries:

```tsx
onDeleteAll={() => deleteElements(selectedElementIds)}
onDuplicateAll={() => duplicateElements(selectedElementIds)}
```

### P2 - `<img>` warnings vẫn nhiều

Files tiêu biểu:

- `src/components/editor/EditorCanvas.tsx:959`
- `src/components/editor/EditorPropertyPanel.tsx:401`
- `src/components/editor/elements/ImageElement.tsx:178`, `:195`
- `src/components/editor/panels/BackgroundPanel.tsx:418`, `:512`
- `src/components/editor/panels/StockPanel.tsx:104`

Đề xuất:

- Nếu editor canvas cần `<img>`, disable rule cục bộ có comment.
- Nếu là preview/public image, cân nhắc `next/image`.

## Những Điểm Đã Cải Thiện Từ V2

- `GroupElement` đã có type chính thức.
- Store đã import các element type cần thiết.
- `deleteBackup` đã sửa runtime bug.
- `CanvasRenderer` không còn là lỗi build đầu tiên.
- `useEditorShortcuts` đã giảm `any` ở `publishTemplate`.
- `CanvasData` bắt đầu được mở rộng với `canvasHeight/backgroundColor/backgroundImage`.

## Thứ Tự Sửa Đề Xuất Sau V3

1. Sửa `CropModal.tsx:621` để `tsc` sạch trong phạm vi editor.
2. Xoá `as any` trong conflict draft preview ở `EditorPage`.
3. Dọn unused imports/destructure trong `EditorCanvas`, `ElementControls`, `useMarqueeSelection`.
4. Mở rộng và chuẩn hoá `CanvasData` cho background settings mới.
5. Type hoá widget config để xoá nhóm lint errors lớn nhất.
6. Sửa các lỗi TypeScript ngoài editor đang chặn `npm run build`.
7. Quyết định policy `<img>` trong editor để giảm warning noise.

## Acceptance Criteria

```bash
npx tsc --noEmit
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npm run build
```

Kỳ vọng trước khi merge:

- Editor không còn TypeScript error.
- Editor không còn lint error.
- Build production không bị chặn bởi lỗi TypeScript ngoài editor.
- Publish/backup/restore giữ đủ canvas data, bao gồm background settings mới.
