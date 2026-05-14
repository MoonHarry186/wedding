# Full Editor Store Documentation (Zustand)

Tài liệu này liệt kê 100% các biến và hàm xử lý có trong `src/store/editor.store.ts`.

## 1. Danh sách Biến (State)

| Tên Biến | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `elements` | `CanvasElement[]` | Danh sách toàn bộ phần tử trên Canvas. |
| `selectedElementIds` | `string[]` | Danh sách ID các phần tử đang được chọn. |
| `activePanel` | `string \| null` | Panel chức năng hiện đang mở (text, image, background,...). |
| `activeTool` | `"select" \| "text"` | Công cụ đang được sử dụng. |
| `canvasHeight` | `number` | Chiều cao của vùng làm việc (px). |
| `zoom` | `number` | Tỉ lệ phóng to/thu nhỏ (1 = 100%). |
| `isDirty` | `boolean` | Trạng thái có thay đổi chưa được lưu. |
| `autoSaveEnabled` | `boolean` | Bật/tắt tự động lưu nháp. |
| `autoSaveNotificationEnabled` | `boolean` | Hiện thông báo khi tự động lưu thành công. |
| `history` / `future` | `HistoryState[]` | Ngăn xếp Undo / Redo. |
| `gridVisible` | `boolean` | Hiển thị/Ẩn lưới toạ độ. |
| `gridSize` | `number` | Kích thước ô lưới. |
| `gridColor` | `string` | Màu sắc của đường lưới. |
| `backups` | `Backup[]` | Danh sách sao lưu cục bộ. |
| `isDraggingOrResizing` | `boolean` | Trạng thái phần tử đang bị kéo hoặc đổi kích thước. |
| `panelActiveKeys` | `Record<string, string[]>` | Lưu trạng thái các menu đang mở trong Panels (UI Persistence). |
| `panelActiveTabs` | `Record<string, string>` | Lưu tab hiện tại của các Panels (UI Persistence). |

---

## 2. Các Hàm Xử Lý (Actions)

### Quản lý Phần tử
| Tên Hàm | Tham Số | Logic / Chức Năng |
| :--- | :--- | :--- |
| `setElements` | `elements` | Ghi đè toàn bộ danh sách phần tử. |
| `addElement` | `type, pos` | Thêm phần tử mới. Tự động gán `zIndex` cao nhất. |
| `updateElement` | `id, updates` | Cập nhật thuộc tính cho 1 phần tử. |
| `updateElements` | `updates[]` | Cập nhật cùng lúc nhiều phần tử (Bulk update). |
| `deleteElement` | `id` | Xoá phần tử (kèm xoá đệ quy con nếu là Nhóm). |
| `duplicateElement` | `id` | Nhân bản phần tử. |

### Vị trí & Thứ tự lớp (Layering)
| Tên Hàm | Tham Số | Logic / Chức Năng |
| :--- | :--- | :--- |
| `moveElement` | `id, dx, dy` | Di chuyển phần tử (kéo theo con nếu là Nhóm). |
| `bringToFront` | `id` | Đưa lên trên cùng. |
| `sendToBack` | `id` | Đưa xuống dưới cùng. |
| `bringForward` | `id` | Đưa lên 1 lớp. |
| `sendBackward` | `id` | Đưa xuống 1 lớp. |
| `updateZIndexes` | `ids` | Sắp xếp lại thứ tự lớp dựa trên danh sách ID. |
| `toggleLock` | `id` | Khoá/Mở khoá phần tử. |

### Hệ thống (Lịch sử & Sao lưu)
| Tên Hàm | Tham Số | Logic / Chức Năng |
| :--- | :--- | :--- |
| `pushHistory` | `name` | Lưu Snapshot hiện tại vào lịch sử. |
| `undo` / `redo` | - | Quay lại / Tiến tới trạng thái thiết kế. |
| `jumpToHistory` | `index` | Nhảy trực tiếp tới một bước trong danh sách lịch sử. |
| `jumpToFuture` | `index` | Nhảy tới một bước trong danh sách tương lai. |
| `addBackup` | `tid, el, ...` | Lưu bản sao lưu vào LocalStorage. |
| `loadBackup` | `id` | Phục hồi dữ liệu từ bản sao lưu. |
| `save` | - | Kích hoạt lưu dữ liệu lên server. |

### Cài đặt & UI
| Tên Hàm | Tham Số | Logic / Chức Năng |
| :--- | :--- | :--- |
| `setZoom` | `zoom` | Thay đổi tỉ lệ zoom canvas. |
| `setCanvasHeight` | `height` | Thay đổi chiều cao canvas. |
| `setActivePanel` | `panel` | Chuyển đổi panel chức năng. |
| `setActiveTool` | `tool` | Chuyển đổi công cụ (select/text). |
| `setGridVisible` | `visible` | Bật/tắt lưới. |
| `setGridSize/Color`| `val` | Chỉnh kích thước/màu lưới. |
| `setPanelActiveKeys`| `p, keys` | Lưu trạng thái Collapse của Panel. |
| `setPanelActiveTab` | `p, tab` | Lưu Tab đang mở của Panel. |

---

## 3. Các Logic Đặc Biệt

| Tính Năng | Mô Tả Logic |
| :--- | :--- |
| **Recursive Grouping** | Các hành động di chuyển/xoá trên Group sẽ duyệt mảng `elements` để tìm các phần tử có `groupId` khớp để xử lý cùng lúc. |
| **UI Persistence** | Biến `panelActiveKeys` và `panelActiveTabs` giúp trình chỉnh sửa ghi nhớ bạn đang mở Panel nào, Tab nào ngay cả khi bạn F5. |
| **Automated Pruning** | **Giới hạn 5 bản lưu/template:** Chỉ giữ 5 bản sao lưu mới nhất cho mỗi template. **Hết hạn sau 7 ngày:** Các bản sao lưu cũ hơn 7 ngày (toàn hệ thống) sẽ tự động bị xoá khi khởi chạy Editor. |
| **Immutable Updates** | Mọi action đều sử dụng `set((state) => ({...}))` đảm bảo tính bất biến (immutability). |
