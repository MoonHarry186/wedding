# Editor Code Review Report V2

Ngày review: 2026-05-13

## Phạm vi

Review lại sau refactor các phần liên quan trực tiếp tới editor:

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

## Tóm Tắt V2

Refactor đã có cải thiện rõ về tổ chức code: `EditorCanvas.tsx` giảm từ khoảng 2,278 dòng xuống 1,252 dòng, tách thêm `ElementControls`, `MultiSelectionBox`, `ResizeHandle`, `useEditorShortcuts`, và `useMarqueeSelection`.

Tuy nhiên trạng thái build/type chưa tốt hơn về mặt correctness. Các lỗi P0 từ v1 vẫn còn: thiếu `GroupElement` trong type model, `deleteBackup` vẫn lỗi runtime, store vẫn dùng type chưa import, conflict draft preview vẫn truyền sai props, và build toàn app vẫn fail ở import `CanvasRenderer`. Refactor mới còn thêm một số warning/typing debt trong `useEditorShortcuts` và chưa dọn các destructured values thừa ở `EditorCanvas`.

Kết quả kiểm tra V2:

- `lint`: 15 errors, 90 warnings.
- `tsc --noEmit`: fail. Các lỗi editor chính vẫn nằm ở type model/store/page preview.
- `build`: fail ở `src/app/invitations/[slug]/page.tsx` vì import default `CanvasRenderer` trong khi module export named `CanvasRenderer`.

So với V1:

- Tốt hơn: `EditorCanvas` đã nhỏ hơn và một số logic được tách module.
- Chưa tốt hơn: số lint problems tăng từ 92 lên 105 do thêm hook/file mới nhưng chưa type/dọn warnings.
- Chưa giải quyết: các P0/P1 chính của v1 vẫn còn.

## Findings Ưu Tiên

### P0 - Type model vẫn thiếu `GroupElement`

File: `src/types/editor.ts:103`

`CanvasElement` vẫn reference `GroupElement`, nhưng file không định nghĩa/export `GroupElement`.

Hệ quả hiện tại từ `tsc`:

- `src/components/editor/elements/GroupElement.tsx` không import được `GroupElement`.
- `src/store/editor.store.ts` không resolve được `TextElement`, `ImageElement`, `WidgetElement`, `GroupElement` vì chỉ import `CanvasElement, ElementType`.
- Các action group/ungroup/duplicate/resize group không có type contract đáng tin cậy.

Đề xuất:

```ts
export interface GroupElement extends BaseElement {
  type: "group";
  childIds: string[];
}
```

Sau đó cập nhật import trong store:

```ts
import type {
  CanvasElement,
  ElementType,
  TextElement,
  ImageElement,
  WidgetElement,
  GroupElement,
} from "@/types/editor";
```

### P0 - `deleteBackup` vẫn là bug runtime chắc chắn

File: `src/store/editor.store.ts:443`

Code hiện tại vẫn là:

```ts
set((state) => ({
  backups: state.filter((b) => b.id !== backupId),
}));
```

`state` là object `EditorState`, không có `.filter()`. Flow xoá backup sẽ crash.

Đề xuất:

```ts
set((state) => ({
  backups: state.backups.filter((b) => b.id !== backupId),
}));
```

### P0 - Conflict draft preview vẫn truyền sai props

File: `src/app/editor/[id]/page.tsx:317`

`tsc` vẫn báo:

- `GroupElement` không có prop `elements`; component hiện dùng `overrideElements`.
- `TextElement`/`ImageElement` không có prop `zoom`.
- `conflictDraft` có thể `null` trong restore handler.

Đề xuất:

- Đổi `elements={conflictDraft.elements}` thành `overrideElements={conflictDraft.elements}`.
- Xoá `zoom={1}` khỏi `GroupElement`, `TextElement`, `ImageElement`.
- Guard `if (!conflictDraft) return;` trong handler restore.

### P0 - Build toàn app vẫn bị chặn bởi import `CanvasRenderer`

File: `src/app/invitations/[slug]/page.tsx:8`

Build vẫn fail vì import default:

```ts
import CanvasRenderer from "@/components/invitations/CanvasRenderer";
```

Trong khi module export named `CanvasRenderer`.

Đề xuất:

```ts
import { CanvasRenderer } from "@/components/invitations/CanvasRenderer";
```

Lỗi này không nằm trong editor nhưng chặn mọi xác nhận production build.

### P1 - Refactor `EditorCanvas` chưa hoàn tất, còn nhiều state/action thừa

File: `src/components/editor/EditorCanvas.tsx:77`

Sau khi tách `useEditorShortcuts`, `EditorCanvas` vẫn destructure nhiều giá trị không còn dùng:

- `message`
- `groupElements`, `ungroupElements`
- `undo`, `redo`, `history`, `future`
- `setIsDraggingOrResizing`, `addBackup`, `setDirty`, `setPreviewMode`
- `deleteElements`, `duplicateElements`, `moveElements`, `setIsCropModalOpen`
- `canvasRef`, `textElements`
- Một số icon import thừa: `RiFullscreenLine`, `RiVolumeMuteLine`, `RiArrowGoForwardLine`, `RiHome4Line`

Hệ quả:

- Lint warning nhiều hơn.
- Component vẫn phụ thuộc store quá rộng dù đã tách hook.
- Khó biết action nào thực sự thuộc canvas và action nào thuộc shortcut layer.

Đề xuất:

- Sau mỗi extraction, dọn destructuring ở component gọi.
- Chỉ lấy store selectors/action đúng nơi cần dùng.
- Nếu dùng Zustand, cân nhắc selector riêng để giảm re-render và tránh kéo toàn store vào component.

### P1 - `useEditorShortcuts` tách đúng hướng nhưng vẫn dùng `any` và ref quá rộng

File: `src/hooks/useEditorShortcuts.ts:8`

Hook mới giúp giảm kích thước `EditorCanvas`, nhưng vẫn còn vấn đề:

- `publishTemplate: any` tạo lint error.
- `latestRef` giữ rất nhiều state/action, tương tự pattern cũ trong `EditorCanvas`.
- Hook gọi `App.useApp()` bên trong, làm hook phụ thuộc Ant context và khó test.
- Lint còn báo dependency `message` ở effect.

Đề xuất:

- Type `publishTemplate` bằng return type của `usePublishTemplate` hoặc interface tối thiểu:

```ts
type PublishMutation = {
  isPending: boolean;
  mutateAsync: (input: {
    id: string;
    canvasData: Record<string, unknown>;
    changeNote?: string;
  }) => Promise<unknown>;
};
```

- Pass `messageApi` từ caller hoặc wrap publish shortcut riêng.
- Tách shortcut theo nhóm: selection, transform, publish, panel navigation.
- Với React 19, cân nhắc `useEffectEvent` thay vì `latestRef` lớn nếu project convention cho phép.

### P1 - `useMarqueeSelection` có stale `elements`

File: `src/hooks/useMarqueeSelection.ts:8`

`handlePageMouseDown` capture `elements` từ render hiện tại, sau đó document `mousemove` dùng closure đó. Nếu element list thay đổi trong lúc kéo hoặc do concurrent update, hit-test có thể stale. Hook cũng import `useEffect` nhưng không dùng.

Đề xuất:

- Dùng `useEditorStore.getState().elements` trong `onMouseMove`, tương tự selected ids.
- Xoá import `useEffect`.
- Return thêm state `isDraggingMarquee` nếu caller cần phân biệt click background và drag selection, thay vì để logic click/marquee tách rời dễ conflict.

### P1 - Background properties được thêm vào store nhưng cần kiểm tra save/load contract

Files:

- `src/store/editor.store.ts:63`
- `src/components/editor/EditorCanvas.tsx:117`

Store đã có `backgroundSize`, `backgroundRepeat`, `backgroundPosition`, `backgroundAttachment`, và canvas dùng chúng. Cần kiểm tra các flow persist/publish/restore có lưu đầy đủ không:

- Auto backup hiện `addBackup` chỉ lưu `backgroundColor` và `backgroundImage`.
- `canvasData` publish shortcut trong `useEditorShortcuts` chỉ lưu `{ elements, canvasHeight }`.
- Restore server data trong `EditorPage` chủ yếu load `elements` và `canvasHeight`.

Rủi ro: user chỉnh background size/repeat/position nhưng publish/backup không giữ lại.

Đề xuất:

- Chuẩn hoá `CanvasData` gồm `elements`, `canvasHeight`, `backgroundColor`, `backgroundImage`, `backgroundSize`, `backgroundRepeat`, `backgroundPosition`, `backgroundAttachment`, `bgMusicUrl` nếu thuộc canvas.
- Dùng một helper `serializeCanvasData(state)` cho publish, backup, restore.

### P2 - Widget typing vẫn là nguồn lint errors

Files:

- `src/types/editor.ts:100`
- `src/components/editor/elements/WidgetElement.tsx:137`
- `src/components/editor/panels/CalendarPanel.tsx:54`
- `src/components/editor/panels/CountdownPanel.tsx:31`
- `src/components/editor/panels/GiftPanel.tsx:54`
- `src/components/editor/panels/MapPanel.tsx:31`
- `src/components/editor/panels/VideoPanel.tsx:27`

`WidgetElement.config: Record<string, any>` vẫn kéo theo nhiều `no-explicit-any` errors.

Đề xuất:

- Tạo discriminated union theo `widgetType`.
- Tách config type cho calendar/countdown/map/video/gift.
- Panel props nhận đúng widget config type thay vì `any`.

### P2 - `ElementControls` extraction tốt nhưng còn cleanup nhỏ

File: `src/components/editor/ElementControls.tsx:2`

`cn` được import nhưng không dùng. Đây là nhỏ, nhưng phản ánh refactor chưa cleanup.

Ngoài ra `ElementControls` vẫn chứa nhiều DOM imperative resize logic. Đây có thể chấp nhận cho editor performance, nhưng nên có contract rõ: DOM update trong drag, store update khi mouseup.

### P2 - Multi-selection delete/duplicate đang gọi từng element riêng lẻ

File: `src/components/editor/EditorCanvas.tsx` nơi gọi `MultiSelectionBox`

Flow hiện truyền:

```tsx
onDeleteAll={() => selectedElementIds.forEach((id) => deleteElement(id))}
onDuplicateAll={() => selectedElementIds.forEach((id) => duplicateElement(id))}
```

Nếu store đã có `deleteElements` và `duplicateElements`, gọi từng phần tử sẽ tạo nhiều history entries và có thể sai với group/child relations.

Đề xuất:

```tsx
onDeleteAll={() => deleteElements(selectedElementIds)}
onDuplicateAll={() => duplicateElements(selectedElementIds)}
```

Sau đó chỉ destructure hai action này nếu thực sự dùng.

### P2 - Lint warning `<img>` vẫn nhiều

Files tiêu biểu:

- `src/components/editor/EditorCanvas.tsx:959`
- `src/components/editor/EditorPropertyPanel.tsx:401`
- `src/components/editor/elements/ImageElement.tsx:178`, `:195`
- `src/components/editor/panels/BackgroundPanel.tsx:418`, `:512`
- `src/components/editor/panels/StockPanel.tsx:104`

Nếu editor intentionally dùng `<img>` để render object URL/S3 nhanh, nên disable rule cục bộ có comment. Nếu không, migrate các preview/static image sang `next/image`.

## Nhận Xét Về Refactor

Điểm tốt:

- `EditorCanvas` đã bớt monolithic hơn.
- `ElementControls`, `MultiSelectionBox`, `ResizeHandle` là các boundary hợp lý.
- `useEditorShortcuts` và `useMarqueeSelection` là hướng đúng để tách behavior khỏi render.

Điểm chưa đạt:

- Extraction chưa đi kèm cleanup import/destructure.
- Type errors nền tảng chưa được xử lý trước khi refactor hành vi.
- Hook mới vẫn mang pattern cũ (`latestRef` rất rộng), nên chỉ di chuyển complexity chứ chưa giảm nhiều.
- Save/load canvas data chưa đồng bộ với background properties mới.

## Thứ Tự Sửa Đề Xuất Sau V2

1. Sửa `src/types/editor.ts`: thêm `GroupElement`, type widget config tối thiểu, thêm field style được dùng thực tế.
2. Sửa import type và bug `deleteBackup` trong `src/store/editor.store.ts`.
3. Sửa props conflict preview trong `src/app/editor/[id]/page.tsx`.
4. Sửa import `CanvasRenderer` để build chạy được.
5. Chuẩn hoá `CanvasData` và dùng helper serialize/restore chung.
6. Dọn unused imports/destructuring sau refactor.
7. Type `useEditorShortcuts` thay vì `any`, tách publish shortcut ra khỏi keyboard core.
8. Quyết định policy `<img>` trong editor và giảm warning noise.

## Acceptance Criteria

```bash
npx tsc --noEmit
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
npm run build
```

Kỳ vọng trước khi tiếp tục thêm UI:

- Không còn TypeScript error trong editor.
- Không còn lint error trong editor.
- Build production không fail vì export/import sai.
- Publish/backup/restore giữ đủ canvas data gồm background settings mới.
