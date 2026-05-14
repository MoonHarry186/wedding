# Editor Code Review Report V5

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

Ghi chú: `npm run build` trong sandbox vẫn bị Turbopack panic do sandbox chặn bind port. Đã chạy lại ngoài sandbox; build production pass.

## Tóm Tắt V5

V5 là bước cải thiện lớn so với V4:

- `npx tsc --noEmit`: pass.
- `npm run build`: pass khi chạy ngoài sandbox.
- `lint`: 0 errors, 76 warnings.

So với V4:

- Lint errors giảm từ 10 xuống 0.
- TypeScript errors trong editor đã được xử lý.
- Build không còn fail ở `dashboard/templates/categories` hoặc các lỗi editor.
- Các vấn đề còn lại chủ yếu là cleanup/maintainability: unused imports/vars, `<img>` policy, hook dependency warnings.

## Kết Quả Kiểm Tra

### Lint

```text
76 problems (0 errors, 76 warnings)
```

Không còn lint error trong phạm vi editor/frontend được kiểm tra.

### TypeScript

```text
npx tsc --noEmit
```

Pass, không có output lỗi.

### Build

Build trong sandbox:

```text
TurbopackInternalError ... binding to a port ... Operation not permitted
```

Đây là lỗi môi trường sandbox, không phải lỗi code. Build ngoài sandbox:

```text
✓ Compiled successfully
Finished TypeScript
✓ Generating static pages
```

Pass.

## Findings Ưu Tiên

### P1 - Lint warning còn nhiều, cần cleanup trước khi bật fail-on-warning

Hiện còn 76 warnings. Không chặn build, nhưng làm giảm tín hiệu review vì warning thật dễ bị bỏ qua.

Nhóm chính:

- Unused imports/vars trong `EditorPage`, `EditorCanvas`, panels, hooks.
- `<img>` warnings trong canvas/editor preview/media grids.
- Hook dependency warnings trong `TextElement`, `ImageAddPanel`, `CropModal`, `useEditorShortcuts`.

Đề xuất:

- Dọn unused trước vì ít rủi ro nhất.
- Sau đó quyết định policy cho `<img>` trong editor.
- Cuối cùng xử lý hook dependency theo từng hook để tránh regression.

### P1 - `EditorPage` còn destructure nhiều field không dùng

File: `src/app/editor/[id]/page.tsx`

Warnings:

- `setElements`
- `elements`
- `canvasHeight`
- `setCanvasHeight`
- `activePanel`
- `getCanvasData`

Đề xuất:

- Xoá khỏi destructuring nếu không còn dùng sau khi chuyển sang `setCanvasData`.
- Nếu cần cho future work, không giữ trong code hiện tại; thêm lại khi dùng.

### P1 - `EditorCanvas` vẫn còn cleanup sau refactor

File: `src/components/editor/EditorCanvas.tsx`

Warnings:

- `App` import không dùng.
- `addBackup` destructure không dùng.
- `canvasRef` không dùng.
- `textElements` không dùng.
- `<img>` warning tại quick photo strip.

Đề xuất:

- Xoá `App`, `addBackup`, `canvasRef`, `textElements`.
- Với `<img>` quick strip: nếu đây là editor-only dynamic image, thêm eslint disable cục bộ có comment; nếu không thì chuyển sang `next/image`.

### P1 - Hook dependency warnings cần xử lý có chủ đích

Files:

- `src/components/editor/elements/TextElement.tsx`
- `src/components/editor/panels/ImageAddPanel.tsx`
- `src/components/editor/modals/CropModal.tsx`
- `src/hooks/useEditorShortcuts.ts`

Không nên sửa bằng cách thêm dependency mù quáng vì có thể làm drag/resize/keyboard listener re-register quá nhiều.

Đề xuất:

- `TextElement`: kiểm tra `ResizeObserver` effect có cần `element.height`, `isDraggingOrResizing`, `onUpdate`; nếu `onUpdate` không stable, cân nhắc local ref hoặc stable callback boundary.
- `ImageAddPanel`: thêm `message` nếu stable từ Ant App context, hoặc wrap callback theo đúng dependency.
- `CropModal`: bỏ dependency `pan` nếu thật sự không cần.
- `useEditorShortcuts`: thêm `message` vào dependency hoặc pass message API từ caller theo interface ổn định.

### P2 - `<img>` warning cần policy chính thức

Files tiêu biểu:

- `src/components/editor/EditorCanvas.tsx`
- `src/components/editor/EditorPropertyPanel.tsx`
- `src/components/editor/elements/ImageElement.tsx`
- `src/components/editor/panels/BackgroundPanel.tsx`
- `src/components/editor/panels/ImageAddPanel.tsx`
- `src/components/editor/panels/StockPanel.tsx`

Trong editor, `<img>` thường hợp lý vì ảnh là user-uploaded/S3/object-fit/crop dynamic. Nhưng để warning không lặp lại:

- Với editor canvas/media grid: thêm eslint disable cục bộ có comment giải thích.
- Với public/static preview: cân nhắc `next/image`.

### P2 - Widget typing đã đủ để pass type-check, nhưng cần kiểm tra domain completeness

V4 từng fail do widget config union chưa narrow. V5 đã pass `tsc`, tức contract hiện đã nhất quán ở mức compiler.

Điểm cần kiểm tra tiếp:

- Các field dynamic như `fullDate`, `fullDate2`, `style`, `accounts`, `modalTitle`, `opacity`, `fontSize` đã được đặt đúng config type chưa.
- Public renderer có hiểu cùng schema với editor không.
- Dữ liệu widget cũ trong localStorage/server có cần migration/default không.

### P2 - CanvasData/backup migration cần test runtime

V4 từng có mismatch giữa backup cũ `{ elements, canvasHeight }` và backup mới `{ canvasData }`. V5 đã pass type-check, nhưng vẫn nên test runtime:

- Load template có backup cũ trong localStorage.
- Load template có backup mới.
- Restore draft.
- Publish rồi mở public invitation.
- Background settings mới có được giữ qua reload/publish không.

## Những Điểm Đã Cải Thiện Từ V4

- `CanvasData` import/usage đã được sửa đủ để `tsc` pass.
- Backup shape mismatch đã được xử lý ở mức type-check.
- `addElement` missing trong `EditorCanvas` đã được xử lý.
- `useEditorShortcuts` latest ref / publish type không còn gây `tsc` error.
- Widget config union không còn gây hàng loạt property access errors.
- Build production pass ngoài sandbox.

## Rủi Ro Còn Lại

- 76 lint warnings có thể che mất warning mới quan trọng.
- Hook dependency warnings nếu bị bỏ qua lâu dài có thể tạo stale closure bug.
- `<img>` warnings chưa có policy nên sẽ tiếp tục gây noise.
- Build trong sandbox vẫn panic do môi trường; khi review cần chạy ngoài sandbox hoặc cấu hình Next/Turbopack phù hợp.

## Thứ Tự Cleanup Đề Xuất Sau V5

1. Dọn unused imports/vars trong `EditorPage`, `EditorCanvas`, panels, hooks.
2. Thiết lập policy `<img>` trong editor và suppress/migrate có chủ đích.
3. Xử lý hook dependency warnings theo từng hook.
4. Test runtime backup/restore/publish với `CanvasData` mới.
5. Khi warnings giảm về mức thấp, cân nhắc bật fail-on-warning cho scope editor.

## Acceptance Criteria Hiện Tại

Đã đạt:

```bash
npx tsc --noEmit
npm run build
```

Chưa đạt hoàn toàn:

```bash
npm run lint -- src/app/editor src/components/editor src/store src/hooks src/api src/types
```

Lệnh lint đã không còn error, nhưng còn 76 warnings cần cleanup.
