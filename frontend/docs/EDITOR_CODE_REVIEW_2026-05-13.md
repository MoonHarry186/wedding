# Editor Code Review Report

Ngày review: 2026-05-13

## Phạm vi

Review các phần liên quan trực tiếp tới editor trong frontend:

- `src/app/editor/[id]/page.tsx`
- `src/components/editor/**`
- `src/store/editor.store.ts`
- `src/types/editor.ts`
- `src/hooks/useDrag.ts`, `src/hooks/useRotate.ts`, `src/hooks/useElementAnimation.ts`
- `src/api/media.api.ts`, `src/api/templates.api.ts`

Các lệnh đã chạy:

```bash
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npm run build
npx tsc --noEmit
```

## Tóm Tắt

Editor hiện chưa đạt trạng thái an toàn để build/type-check sạch. Lỗi lớn nhất là contract type của editor bị vỡ: `GroupElement` được import/sử dụng ở nhiều nơi nhưng không được định nghĩa trong `src/types/editor.ts`, store dùng các type chưa import, và preview restore modal truyền props không khớp component. Ngoài ra có bug runtime rõ ràng trong `deleteBackup`, nhiều `any`, nhiều import/biến thừa, và hook keyboard trong `EditorCanvas` đang né dependency bằng ref khá lớn nên khó bảo trì.

Kết quả kiểm tra:

- `lint`: 14 errors, 78 warnings.
- `tsc --noEmit`: fail với nhiều lỗi editor và một số lỗi ngoài editor.
- `build`: fail ở `src/app/invitations/[slug]/page.tsx` vì import default `CanvasRenderer` trong khi module export named `CanvasRenderer`. Lỗi này nằm ngoài editor nhưng đang chặn build toàn app.

## Findings Ưu Tiên

### P0 - Type model của editor bị thiếu `GroupElement`

File: `src/types/editor.ts:103`

`CanvasElement` đang khai báo `TextElement | ImageElement | GroupElement | WidgetElement`, nhưng `GroupElement` không được định nghĩa/export trong file này. Hệ quả:

- `src/components/editor/elements/GroupElement.tsx` import `GroupElement` từ `@/types/editor` sẽ fail type-check.
- `src/store/editor.store.ts` sử dụng `GroupElement`, `TextElement`, `ImageElement`, `WidgetElement` như type nhưng chỉ import `CanvasElement, ElementType`.
- Các thao tác group/ungroup, duplicate recursive, update group size đang dựa vào type không tồn tại nên rất dễ phát sinh regression.

Đề xuất:

- Thêm `export interface GroupElement extends BaseElement { type: "group"; childIds: string[]; }`.
- Import đầy đủ type trong `editor.store.ts` bằng `import type { CanvasElement, ElementType, TextElement, ImageElement, WidgetElement, GroupElement } from "@/types/editor";`.
- Bổ sung các field widget/common đang được dùng nhưng type chưa có, ví dụ `boxShadow` cho widget nếu widget thật sự support shadow.

### P0 - `deleteBackup` đang gọi `filter` trên toàn bộ state

File: `src/store/editor.store.ts:431`

Code hiện tại:

```ts
set((state) => ({
  backups: state.filter((b) => b.id !== backupId),
}));
```

`state` là `EditorState`, không phải array. Đây là bug runtime chắc chắn khi xoá backup.

Đề xuất:

```ts
set((state) => ({
  backups: state.backups.filter((b) => b.id !== backupId),
}));
```

### P0 - Store thiếu action so với state type

File: `src/store/editor.store.ts:180`

`tsc` báo object khởi tạo store thiếu `setBackgroundSize`, `setBackgroundRepeat`, `setBackgroundPosition`. Điều này cho thấy interface `EditorState` và implementation đã lệch nhau.

Đề xuất:

- Nếu UI đã bỏ các field này, xoá khỏi interface.
- Nếu UI còn dùng, thêm state/action implementation và persist migration rõ ràng.

### P1 - Restore preview modal truyền sai props cho element components

File: `src/app/editor/[id]/page.tsx:314`

Trong conflict draft preview:

- `GroupElement` nhận props `elements`, `zoom`, nhưng component hiện chỉ nhận `overrideElements`, không nhận `elements`/`zoom`.
- `TextElement` và `ImageElement` cũng không nhận `zoom`.
- `conflictDraft` có thể `null` trong handler restore tại `src/app/editor/[id]/page.tsx:370`.

Đề xuất:

- Đổi `elements={conflictDraft.elements}` thành `overrideElements={conflictDraft.elements}`.
- Xoá prop `zoom={1}` khỏi `GroupElement`, `TextElement`, `ImageElement`.
- Trong `onClick` restore, guard:

```ts
if (!conflictDraft) return;
```

### P1 - `EditorCanvas` quá lớn và chứa nhiều trách nhiệm

File: `src/components/editor/EditorCanvas.tsx:1`

File hiện dài khoảng 2,278 dòng và gom nhiều trách nhiệm:

- Render canvas.
- Keyboard shortcuts.
- Selection/marquee.
- Resize/zoom/pan.
- Context menu.
- Quick photo strip.
- Modals nội dung/phím tắt.
- Element controls/multi-selection controls.

Hệ quả:

- Khó review regression khi sửa UI.
- Hook dependency bị né bằng `latestRef` lớn tại `src/components/editor/EditorCanvas.tsx:965`.
- Có nhiều unused imports/state và warning hook dependency.

Đề xuất refactor theo module:

- `CanvasViewport.tsx`: pan/zoom/scroll shell.
- `CanvasPage.tsx`: page root/background/grid/render elements.
- `useEditorShortcuts.ts`: keyboard shortcuts.
- `useMarqueeSelection.ts`: rubber-band selection.
- `ElementControls.tsx`, `MultiSelectionBox.tsx`: tách riêng nếu chưa tách.
- `CanvasModals.tsx`: content modal, shortcuts modal, crop hooks.

### P1 - Keyboard shortcuts effect có dependency không rõ ràng

File: `src/components/editor/EditorCanvas.tsx:994`

Lint báo `useEffect` không có dependency nhưng gọi nhiều setter/state. Hiện code dùng `latestRef` để tránh re-register event listener, nhưng ref chứa rất nhiều giá trị và setter. Cách này chạy được nhưng rất dễ stale nếu quên thêm field mới vào ref.

Đề xuất:

- Tách `useEditorShortcuts`.
- Chỉ pass action/state tối thiểu.
- Với React mới, cân nhắc `useEffectEvent` nếu dự án bật React Compiler/React 19 pattern.

### P1 - Build app đang bị chặn bởi import `CanvasRenderer`

File: `src/app/invitations/[slug]/page.tsx:8`

Build fail vì đang import default:

```ts
import CanvasRenderer from "@/components/invitations/CanvasRenderer";
```

Trong khi module export named `CanvasRenderer`. Dù không nằm trong editor, lỗi này làm không thể xác nhận build production cho editor.

Đề xuất:

```ts
import { CanvasRenderer } from "@/components/invitations/CanvasRenderer";
```

Hoặc đổi component sang default export nếu đó là convention mong muốn.

### P2 - Widget config dùng `any` và type quá lỏng

Files:

- `src/types/editor.ts:100`
- `src/components/editor/elements/WidgetElement.tsx:137`
- `src/components/editor/panels/CalendarPanel.tsx:54`
- `src/components/editor/panels/CountdownPanel.tsx:31`
- `src/components/editor/panels/GiftPanel.tsx:54`
- `src/components/editor/panels/MapPanel.tsx:31`
- `src/components/editor/panels/VideoPanel.tsx:27`

`WidgetElement.config: Record<string, any>` kéo theo hàng loạt `no-explicit-any`. Đây là nguồn lỗi type và làm editor dễ lưu canvasData sai schema.

Đề xuất:

- Tạo discriminated union:

```ts
type WidgetElement =
  | CalendarWidgetElement
  | CountdownWidgetElement
  | MapWidgetElement
  | VideoWidgetElement
  | GiftWidgetElement;
```

- Mỗi widget có `widgetType` và `config` riêng.
- Panel nhận đúng type theo widgetType thay vì `any`.

### P2 - Background infinite scroll cần guard chống duplicate item

File: `src/components/editor/panels/BackgroundPanel.tsx:145`

Khi append page mới:

```ts
reset ? response.items : [...prev, ...response.items]
```

Nếu backend/S3 trả cursor trùng hoặc request bị gọi lại cạnh biên IntersectionObserver, UI có thể duplicate ảnh. Hiện đã có `loadingMoreRef`, nhưng vẫn nên dedupe theo `asset.key`.

Đề xuất:

- Khi append, merge bằng `Map<string, StockAsset>`.
- Nếu `response.nextCursor` không đổi với cursor hiện tại, force `hasMore=false` để tránh loop.

### P2 - `activePanel` destructured nhưng không dùng

File: `src/app/editor/[id]/page.tsx:59`

Biến `activePanel` đang lấy từ store nhưng không dùng. Đây là warning nhỏ, nhưng nên xoá để giảm noise.

### P2 - Nhiều import/state thừa trong editor

Ví dụ:

- `src/components/editor/EditorCanvas.tsx:14`, `:16`, `:39`, `:40`: icon import thừa.
- `src/components/editor/EditorCanvas.tsx:699`, `:700`, `:702`, `:703`, `:858`, `:1342`: state/ref thừa.
- `src/components/editor/modals/BackupModal.tsx:79`: `formatTime` thừa.
- Nhiều panel có unused imports: `TextAddPanel`, `ImagePanel`, `MusicPanel`, `LayersPanel`, `HistoryPanel`, `CommonSettings`.

Đề xuất:

- Dọn unused imports/vars trước khi sửa logic lớn để giảm noise.
- Bật rule lint fail-on-warning trong CI sau khi cleanup.

### P2 - `<img>` dùng nhiều trong editor preview/grid

Files tiêu biểu:

- `src/components/editor/CanvasPropertyPanel.tsx:49`
- `src/components/editor/EditorPropertyPanel.tsx:401`
- `src/components/editor/elements/ImageElement.tsx:178`
- `src/components/editor/panels/BackgroundPanel.tsx:418`, `:512`
- `src/components/editor/panels/StockPanel.tsx:104`

Trong editor, dùng `<img>` có thể chấp nhận nếu cần render nhanh ảnh từ user/S3, nhưng warning đang làm nhiễu lint.

Đề xuất:

- Quyết định convention: dùng `next/image` cho preview public, cho phép `<img>` trong editor canvas bằng eslint disable cục bộ có comment.
- Không nên để warning tràn lan vì làm mất tín hiệu từ warning quan trọng.

## Rủi Ro Thiết Kế Hiện Tại

- Store đang persist gần như toàn bộ editor state, chỉ loại `history/future`. Các field UI volatile như modal state, drag state, active panel, selected ids có thể không nên persist.
- `setElements` luôn set `isDirty: false`; khi restore hoặc import data có thể đúng, nhưng nếu caller dùng để cập nhật canvas từ UI thì dễ mất trạng thái dirty.
- Canvas data chưa có schema version. Khi thêm field mới như background image, widget config, crop data, dữ liệu cũ khó migrate an toàn.
- Editor và invitation renderer đang có dấu hiệu lệch export/contract, cần một renderer chung hoặc adapter rõ ràng để public view và editor view không drift.

## Thứ Tự Sửa Đề Xuất

1. Sửa type nền tảng: thêm `GroupElement`, import type đầy đủ trong store, bổ sung/match field thiếu.
2. Sửa bug runtime `deleteBackup`.
3. Sửa conflict draft preview props trong `EditorPage`.
4. Sửa import `CanvasRenderer` để build app chạy được.
5. Dọn `any` của widget theo từng widgetType.
6. Tách `EditorCanvas` thành hooks/components nhỏ.
7. Dọn warning unused imports/vars và thống nhất policy `<img>`.

## Acceptance Criteria Sau Khi Sửa

```bash
npx tsc --noEmit
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npm run build
```

Kỳ vọng:

- Không còn TypeScript error trong editor.
- Không còn lint error trong editor.
- Build production không bị chặn bởi export/import sai.
- Các flow editor chính vẫn hoạt động: load template, edit element, group/ungroup, background image, auto backup/restore, publish.
