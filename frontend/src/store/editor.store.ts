import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_EDITOR_PREVIEW_DEVICE_ID } from "@/constants/editorPreviewDevices";
import type {
  BackupEntry,
  CanvasData,
  CanvasElement,
  ElementType,
  GroupElement,
  TextElement,
  ImageElement,
  WidgetElement,
} from "@/types/editor";

interface HistoryState {
  elements: CanvasElement[];
  canvasHeight: number;
  backgroundColor?: string;
  backgroundImage?: string;
  name: string;
  timestamp: number;
}

interface EditorState {
  editorTheme: "light" | "dark";
  elements: CanvasElement[]; // Danh sách các phần tử trên canvas (văn bản, hình ảnh...)
  selectedElementIds: string[]; // IDs của các phần tử đang được chọn
  activePanel:
    | "text"
    | "image"
    | "background"
    | "stock"
    | "music"
    | "widgets"
    | "templates"
    | "effects"
    | "presets"
    | "history"
    | "layers"
    | null; // Panel hiện đang mở ở sidebar

  bgMusicUrl: string;
  musicVolume: number;
  musicIcon: string;
  musicIconColor: string;

  // Canvas Settings
  canvasHeight: number; // Chiều cao của canvas (px)
  zoom: number; // Tỉ lệ phóng to/thu nhỏ canvas
  isDirty: boolean; // Trạng thái có thay đổi chưa lưu hay không
  autoSaveEnabled: boolean;
  autoSaveNotificationEnabled: boolean;

  // History
  history: HistoryState[];
  future: HistoryState[];

  // Grid
  gridVisible: boolean; // Trạng thái hiển thị lưới
  gridSize: number; // Kích thước ô lưới (px)
  gridColor: string; // Màu sắc của đường lưới
  smartGuidesEnabled: boolean;
  backups: BackupEntry[];

  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
  backgroundPosition: string;
  backgroundAttachment: string;

  // Actions
  setElements: (elements: CanvasElement[]) => void; // Cập nhật toàn bộ danh sách phần tử
  addElement: (
    type: ElementType,
    pos?: { x: number; y: number },
    initialData?: Record<string, unknown>,
  ) => void; // Thêm phần tử mới vào canvas
  updateElement: (id: string, updates: Partial<CanvasElement>) => void; // Cập nhật thuộc tính cho phần tử
  deleteElement: (id: string) => void; // Xoá phần tử khỏi canvas
  deleteElements: (ids: string[]) => void; // Xoá nhiều phần tử cùng lúc
  setSelectedElementIds: (ids: string[]) => void; // Chọn/bỏ chọn phần tử
  setActivePanel: (
    panel:
      | "text"
      | "image"
      | "background"
      | "stock"
      | "music"
      | "widgets"
      | "templates"
      | "effects"
      | "presets"
      | "history"
      | "layers"
      | null,
  ) => void; // Mở panel chức năng
  setZoom: (zoom: number) => void; // Thay đổi tỉ lệ zoom
  setCanvasHeight: (height: number) => void; // Thay đổi chiều cao canvas
  setDirty: (isDirty: boolean) => void; // Đánh dấu trạng thái thay đổi
  toggleAutoSave: () => void;
  toggleAutoSaveNotification: () => void;
  addBackup: (templateId: string) => void;
  loadBackup: (backupId: string) => void;
  deleteBackup: (backupId: string) => void;
  setBackups: (backups: BackupEntry[]) => void;
  isDraggingOrResizing: boolean;
  setIsDraggingOrResizing: (val: boolean) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  pushHistory: (name: string) => void;
  jumpToHistory: (index: number) => void;
  jumpToFuture: (index: number) => void;

  // Layering & Operations
  duplicateElement: (id: string) => void; // Nhân bản phần tử
  duplicateElements: (ids: string[]) => void; // Nhân bản nhiều phần tử
  bringToFront: (id: string) => void; // Đưa phần tử lên lớp trên cùng
  sendToBack: (id: string) => void; // Đưa phần tử xuống lớp dưới cùng
  bringForward: (id: string) => void; // Đưa phần tử lên một lớp
  sendBackward: (id: string) => void; // Đưa phần tử xuống một lớp
  toggleLock: (id: string) => void; // Khoá/Mở khoá vị trí phần tử
  setGridVisible: (visible: boolean) => void; // Bật/tắt lưới
  setGridSize: (size: number) => void; // Chỉnh kích thước lưới
  setGridColor: (color: string) => void; // Chỉnh màu lưới
  setSmartGuidesEnabled: (enabled: boolean) => void;

  // Helpers
  moveElement: (id: string, dx: number, dy: number) => void; // Di chuyển phần tử theo toạ độ dx, dy
  moveElements: (ids: string[], dx: number, dy: number) => void; // Di chuyển nhiều phần tử cùng lúc
  updateElements: (
    updates: Array<{ id: string; changes: Partial<CanvasElement> }>,
  ) => void; // Cập nhật nhiều phần tử cùng lúc
  updateZIndexes: (ids: string[]) => void; // Cập nhật thứ tự lớp dựa trên danh sách ID
  groupElements: () => void;
  ungroupElements: () => void;
  activeTool: "select" | "text";
  setActiveTool: (tool: "select" | "text") => void;

  // UI State Persistence
  panelActiveKeys: Record<string, string[]>;
  panelActiveTabs: Record<string, string>;
  setPanelActiveKeys: (panel: string, keys: string[]) => void;
  setPanelActiveTab: (panel: string, tab: string) => void;
  save: () => void;
  getCanvasData: () => CanvasData;
  setCanvasData: (data: CanvasData) => void;

  // Preview Mode
  previewMode: boolean;
  previewDeviceId: string;
  setPreviewMode: (val: boolean) => void;
  setPreviewDeviceId: (deviceId: string) => void;
  setEditorTheme: (theme: "light" | "dark") => void;
  toggleEditorTheme: () => void;

  // Background Actions
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (image: string) => void;
  setBackgroundSize: (size: string) => void;
  setBackgroundRepeat: (repeat: string) => void;
  setBackgroundPosition: (position: string) => void;
  setBackgroundAttachment: (attachment: string) => void;
  setBgMusicUrl: (url: string) => void;
  setMusicVolume: (volume: number) => void;
  setMusicIcon: (icon: string) => void;
  setMusicIconColor: (color: string) => void;
  animationPreviewNonce: number;
  previewAllAnimations: () => void;

  // Modal States
  isCropModalOpen: boolean;
  setIsCropModalOpen: (val: boolean) => void;

  isReplacingImage: boolean;
  setIsReplacingImage: (val: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      editorTheme: "light",
      elements: [],
      selectedElementIds: [],
      activePanel: null,
      activeTool: "select",
      canvasHeight: 1000,
      zoom: 1,
      backgroundColor: "#ffffff",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundAttachment: "scroll",
      bgMusicUrl: "",
      musicVolume: 80,
      musicIcon: "note",
      musicIconColor: "#8b0000",
      animationPreviewNonce: 0,
      previewAllAnimations: () =>
        set((state) => ({
          animationPreviewNonce: state.animationPreviewNonce + 1,
        })),
      isDraggingOrResizing: false,
      setIsDraggingOrResizing: (val) => set({ isDraggingOrResizing: val }),
      isDirty: false,
      autoSaveEnabled: true,
      autoSaveNotificationEnabled: false,
      backups: [],
      history: [],
      future: [],
      gridVisible: true,
      gridSize: 36,
      gridColor: "#3b82f6",
      smartGuidesEnabled: true,

      isCropModalOpen: false,
      setIsCropModalOpen: (val) => set({ isCropModalOpen: val }),

      isReplacingImage: false,
      setIsReplacingImage: (val) => set({ isReplacingImage: val }),

      previewMode: false,
      previewDeviceId: DEFAULT_EDITOR_PREVIEW_DEVICE_ID,
      setPreviewMode: (val) =>
        set({
          previewMode: val,
          selectedElementIds: val ? [] : get().selectedElementIds,
        }),
      setPreviewDeviceId: (previewDeviceId) => set({ previewDeviceId }),
      setEditorTheme: (theme) => set({ editorTheme: theme }),
      toggleEditorTheme: () =>
        set((state) => ({
          editorTheme: state.editorTheme === "light" ? "dark" : "light",
        })),

      panelActiveKeys: {},
      panelActiveTabs: {},

      setPanelActiveKeys: (panel, keys) =>
        set((state) => ({
          panelActiveKeys: { ...state.panelActiveKeys, [panel]: keys },
        })),

      setPanelActiveTab: (panel, tab) =>
        set((state) => ({
          panelActiveTabs: { ...state.panelActiveTabs, [panel]: tab },
        })),

      save: () => set({ isDirty: false }),
      getCanvasData: () => {
        const state = get();
        return {
          elements: state.elements,
          canvasHeight: state.canvasHeight,
          backgroundColor: state.backgroundColor,
          backgroundImage: state.backgroundImage,
          backgroundSize: state.backgroundSize,
          backgroundRepeat: state.backgroundRepeat,
          backgroundPosition: state.backgroundPosition,
          backgroundAttachment: state.backgroundAttachment,
        };
      },
      setCanvasData: (data: CanvasData) => {
        set({
          elements: data.elements || [],
          canvasHeight: data.canvasHeight || 1000,
          backgroundColor: data.backgroundColor || "#ffffff",
          backgroundImage: data.backgroundImage || "",
          backgroundSize: data.backgroundSize || "cover",
          backgroundRepeat: data.backgroundRepeat || "no-repeat",
          backgroundPosition: data.backgroundPosition || "center",
          backgroundAttachment: data.backgroundAttachment || "scroll",
          isDirty: false,
          history: [],
          future: [],
        });
      },

      setActiveTool: (tool) => set({ activeTool: tool }),

      pushHistory: (name: string) => {
        const {
          elements,
          canvasHeight,
          backgroundColor,
          backgroundImage,
          history,
        } = get();
        const snapshot: HistoryState = {
          elements: JSON.parse(JSON.stringify(elements)),
          canvasHeight,
          backgroundColor,
          backgroundImage,
          name,
          timestamp: Date.now(),
        };

        set({
          history: [...history, snapshot].slice(-50),
          future: [],
        });
      },

      undo: () => {
        const {
          history,
          future,
          elements,
          canvasHeight,
          backgroundColor,
          backgroundImage,
        } = get();
        if (history.length === 0) return;

        const prevState = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        set({
          elements: prevState.elements,
          canvasHeight: prevState.canvasHeight,
          backgroundColor: prevState.backgroundColor ?? "#ffffff",
          backgroundImage: prevState.backgroundImage ?? "",
          history: newHistory,
          future: [
            {
              elements: JSON.parse(JSON.stringify(elements)),
              canvasHeight,
              backgroundColor,
              backgroundImage,
              name: prevState.name,
              timestamp: Date.now(),
            },
            ...future,
          ].slice(0, 50),
          selectedElementIds: [],
          isDirty: true,
        });
      },

      redo: () => {
        const {
          history,
          future,
          elements,
          canvasHeight,
          backgroundColor,
          backgroundImage,
        } = get();
        if (future.length === 0) return;

        const nextState = future[0];
        const newFuture = future.slice(1);

        set({
          elements: nextState.elements,
          canvasHeight: nextState.canvasHeight,
          backgroundColor: nextState.backgroundColor ?? "#ffffff",
          backgroundImage: nextState.backgroundImage ?? "",
          history: [
            ...history,
            {
              elements: JSON.parse(JSON.stringify(elements)),
              canvasHeight,
              backgroundColor,
              backgroundImage,
              name: nextState.name,
              timestamp: Date.now(),
            },
          ].slice(-50),
          future: newFuture,
          selectedElementIds: [],
          isDirty: true,
        });
      },

      jumpToHistory: (index: number) => {
        const {
          history,
          future,
          elements,
          canvasHeight,
          backgroundColor,
          backgroundImage,
        } = get();
        if (index < 0 || index >= history.length) return;

        const targetState = history[index];
        const statesBeforeTarget = history.slice(0, index);
        const statesAfterTarget = history.slice(index + 1);

        const currentStateSnapshot = {
          elements: JSON.parse(JSON.stringify(elements)),
          canvasHeight,
          backgroundColor,
          backgroundImage,
          name: "Trạng thái hiện tại",
          timestamp: Date.now(),
        };

        set({
          elements: targetState.elements,
          canvasHeight: targetState.canvasHeight,
          backgroundColor: targetState.backgroundColor ?? "#ffffff",
          backgroundImage: targetState.backgroundImage ?? "",
          history: statesBeforeTarget,
          future: [
            ...[...statesAfterTarget].reverse(),
            currentStateSnapshot,
            ...future,
          ].slice(0, 50),
          selectedElementIds: [],
          isDirty: true,
        });
      },

      jumpToFuture: (index: number) => {
        const {
          history,
          future,
          elements,
          canvasHeight,
          backgroundColor,
          backgroundImage,
        } = get();
        if (index < 0 || index >= future.length) return;

        const targetState = future[index];
        const statesBeforeTarget = future.slice(0, index);

        const currentStateSnapshot = {
          elements: JSON.parse(JSON.stringify(elements)),
          canvasHeight,
          backgroundColor,
          backgroundImage,
          name: "Trạng thái trước Redo",
          timestamp: Date.now(),
        };

        set({
          elements: targetState.elements,
          canvasHeight: targetState.canvasHeight,
          backgroundColor: targetState.backgroundColor ?? "#ffffff",
          backgroundImage: targetState.backgroundImage ?? "",
          history: [
            ...history,
            currentStateSnapshot,
            ...statesBeforeTarget,
          ].slice(-50),
          future: future.slice(index + 1),
          selectedElementIds: [],
          isDirty: true,
        });
      },

      setElements: (elements) => set({ elements, isDirty: false }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
      setDirty: (dirty) => set({ isDirty: dirty }),
      toggleAutoSave: () =>
        set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled })),
      toggleAutoSaveNotification: () =>
        set((state) => ({
          autoSaveNotificationEnabled: !state.autoSaveNotificationEnabled,
        })),

      setBackups: (backups) => set({ backups }),

      addBackup: (templateId) => {
        const { getCanvasData } = get();
        const newBackup: BackupEntry = {
          id: uuidv4(),
          templateId,
          timestamp: Date.now(),
          canvasData: getCanvasData(),
          status: "private",
        };
        set((state) => {
          let allBackups = [newBackup, ...state.backups];
          const templateBackups = allBackups.filter(
            (b) => b.templateId === templateId,
          );
          if (templateBackups.length > 5) {
            const sorted = [...templateBackups].sort(
              (a, b) => b.timestamp - a.timestamp,
            );
            const newestFiveIds = sorted.slice(0, 5).map((b) => b.id);
            allBackups = allBackups.filter(
              (b) =>
                b.templateId !== templateId || newestFiveIds.includes(b.id),
            );
          }
          return { backups: allBackups };
        });
      },

      loadBackup: (backupId) => {
        const { backups, setCanvasData, pushHistory } = get();
        const backup = backups.find((b) => b.id === backupId);
        if (backup) {
          pushHistory("Khôi phục bản sao lưu");
          setCanvasData(backup.canvasData);
        }
      },

      deleteBackup: (backupId) => {
        set((state) => ({
          backups: state.backups.filter((b) => b.id !== backupId),
        }));
      },

      addElement: (type, pos, initialData) => {
        get().pushHistory(type === "text" ? "Thêm văn bản" : "Thêm hình ảnh");

        const id = uuidv4();
        const base = {
          id,
          type,
          x: pos?.x ?? 50,
          y: pos?.y ?? 50,
          width: type === "text" ? 240 : 150,
          height: type === "text" ? 10 : 150,
          rotation: 0,
          opacity: 1,
          zIndex: get().elements.length + 1,
        };

        let newElement: CanvasElement | undefined = undefined;

        if (type === "text") {
          newElement = {
            ...base,
            type: "text",
            content: "Nhấn để sửa",
            fontSize: 24,
            fontWeight: 500,
            fontFamily: "Inter",
            color: "#000000",
            textAlign: "center",
            letterSpacing: 0,
            lineHeight: 1.2,
          } as TextElement;
        } else if (type === "image") {
          newElement = {
            ...base,
            type: "image",
            url: "",
            objectFit: "cover",
          } as ImageElement;
        } else if (type === "widget") {
          const widgetData = initialData as
            | {
                widgetType?: WidgetElement["widgetType"];
                config?: WidgetElement["config"];
              }
            | undefined;
          newElement = {
            ...base,
            type: "widget",
            widgetType: widgetData?.widgetType || "calendar",
            config: widgetData?.config || {},
            width: 300,
            height: 350,
          } as WidgetElement;
        }

        if (newElement === undefined) return;

        if (initialData) Object.assign(newElement, initialData);

        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementIds: [newElement.id],
          isDirty: true,
        }));
      },

      updateElement: (id, updates) => {
        set((state) => {
          const element = state.elements.find((el) => el.id === id);
          if (!element) return state;

          let newElements = state.elements.map((el) =>
            el.id === id ? ({ ...el, ...updates } as CanvasElement) : el,
          );

          if (
            element.type === "group" &&
            (updates.width !== undefined || updates.height !== undefined) &&
            element.width > 0 &&
            element.height > 0
          ) {
            const group = element as GroupElement;
            const scaleX = (updates.width ?? group.width) / group.width;
            const scaleY = (updates.height ?? group.height) / group.height;

            const scaleDescendants = (
              parentId: string,
              sX: number,
              sY: number,
            ) => {
              newElements = newElements.map((el) => {
                if (el.groupId === parentId) {
                  const elUpdates: Partial<CanvasElement> = {
                    x: el.x * sX,
                    y: el.y * sY,
                    width: el.width * sX,
                  };

                  if (el.type !== "text") {
                    elUpdates.height = el.height * sY;
                  }
                  if (el.type === "text" && (el as TextElement).fontSize) {
                    const isUniform = Math.abs(sX - sY) < 0.01;
                    if (isUniform) {
                      (elUpdates as Partial<TextElement>).fontSize =
                        Math.round((el as TextElement).fontSize * sX * 10) / 10;
                    }
                  }
                  const updatedEl = { ...el, ...elUpdates };

                  if (el.type === "group") {
                    scaleDescendants(el.id, sX, sY);
                  }
                  return updatedEl as CanvasElement;
                }
                return el;
              });
            };

            scaleDescendants(id, scaleX, scaleY);
          }

          return { elements: newElements, isDirty: true };
        });
      },

      deleteElement: (id) => {
        get().deleteElements([id]);
      },

      deleteElements: (ids) => {
        if (ids.length === 0) return;
        get().pushHistory(
          ids.length === 1 ? "Xoá phần tử" : "Xoá nhiều phần tử",
        );
        set((state) => {
          const idsToDelete = new Set<string>();

          const collectIds = (elementId: string) => {
            idsToDelete.add(elementId);
            state.elements.forEach((el) => {
              if (el.groupId === elementId) {
                collectIds(el.id);
              }
            });
          };

          ids.forEach((id) => collectIds(id));

          let newElements = state.elements.filter(
            (el) => !idsToDelete.has(el.id),
          );

          ids.forEach((id) => {
            const elementToDelete = state.elements.find((el) => el.id === id);
            const parentId = elementToDelete?.groupId;
            if (parentId) {
              newElements = newElements.map((el) => {
                if (el.id === parentId && el.type === "group") {
                  return {
                    ...el,
                    childIds: (el.childIds || []).filter(
                      (childId) => childId !== id,
                    ),
                  };
                }
                return el;
              });
            }
          });

          return {
            elements: newElements,
            selectedElementIds: state.selectedElementIds.filter(
              (selectedId) => !idsToDelete.has(selectedId),
            ),
            isDirty: true,
          };
        });
      },

      setZoom: (zoom) => set({ zoom }),
      setCanvasHeight: (height) => set({ canvasHeight: height }),

      duplicateElement: (id) => {
        get().duplicateElements([id]);
      },

      duplicateElements: (ids) => {
        if (ids.length === 0) return;
        get().pushHistory(
          ids.length === 1 ? "Nhân bản phần tử" : "Nhân bản nhiều phần tử",
        );

        const { elements } = get();
        const allNewElements: CanvasElement[] = [];
        const topLevelNewIds: string[] = [];
        const idMap = new Map<string, string>();

        const duplicateRecursive = (
          targetId: string,
          parentId?: string,
          offset = 20,
        ): string | null => {
          const original = elements.find((el) => el.id === targetId);
          if (!original) return null;

          const newId = uuidv4();
          idMap.set(targetId, newId);

          const newElement = {
            ...original,
            id: newId,
            x: original.x + (parentId ? 0 : offset),
            y: original.y + (parentId ? 0 : offset),
            groupId: parentId,
            zIndex: elements.length + allNewElements.length + 1,
          } as CanvasElement;

          allNewElements.push(newElement);

          if (original.type === "group") {
            const children = elements.filter(
              (el) => el.groupId === original.id,
            );
            const newChildIds = children
              .map((child) => duplicateRecursive(child.id, newId, 0))
              .filter(Boolean) as string[];
            (newElement as GroupElement).childIds = newChildIds;
          }

          return newId;
        };

        ids.forEach((id) => {
          if (idMap.has(id)) return;
          const newId = duplicateRecursive(id);
          if (newId) topLevelNewIds.push(newId);
        });

        set((state) => ({
          elements: [...state.elements, ...allNewElements],
          selectedElementIds: topLevelNewIds,
          isDirty: true,
        }));
      },

      bringToFront: (id) => {
        get().pushHistory("Đưa lên trên cùng");
        const maxZ = Math.max(...get().elements.map((el) => el.zIndex || 0), 0);
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: maxZ + 1 } : el,
          ),
          isDirty: true,
        }));
      },

      sendToBack: (id) => {
        get().pushHistory("Đưa xuống dưới cùng");
        const minZ = Math.min(...get().elements.map((el) => el.zIndex || 0), 0);
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, zIndex: minZ - 1 } : el,
          ),
          isDirty: true,
        }));
      },

      bringForward: (id) => {
        get().pushHistory("Đưa lên 1 lớp");
        const elements = [...get().elements].sort(
          (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
        );
        const index = elements.findIndex((el) => el.id === id);
        if (index === -1 || index === elements.length - 1) return;

        const current = elements[index];
        const next = elements[index + 1];

        const currentZ = current.zIndex || 0;
        const nextZ = next.zIndex || 0;

        const newElements = get().elements.map((el) => {
          if (el.id === current.id)
            return { ...el, zIndex: nextZ === currentZ ? currentZ + 1 : nextZ };
          if (el.id === next.id) return { ...el, zIndex: currentZ };
          return el;
        });

        set({ elements: newElements, isDirty: true });
      },

      sendBackward: (id) => {
        get().pushHistory("Đưa xuống 1 lớp");
        const elements = [...get().elements].sort(
          (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
        );
        const index = elements.findIndex((el) => el.id === id);
        if (index <= 0) return;

        const current = elements[index];
        const prev = elements[index - 1];

        const currentZ = current.zIndex || 0;
        const prevZ = prev.zIndex || 0;

        const newElements = get().elements.map((el) => {
          if (el.id === current.id)
            return { ...el, zIndex: prevZ === currentZ ? currentZ - 1 : prevZ };
          if (el.id === prev.id) return { ...el, zIndex: currentZ };
          return el;
        });

        set({ elements: newElements, isDirty: true });
      },

      toggleLock: (id) => {
        get().pushHistory("Khoá/Mở khoá phần tử");
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, isLocked: !el.isLocked } : el,
          ),
          isDirty: true,
        }));
      },

      setGridVisible: (visible) => set({ gridVisible: visible }),
      setGridSize: (size) => set({ gridSize: size }),
      setGridColor: (color) => set({ gridColor: color }),
      setSmartGuidesEnabled: (smartGuidesEnabled) => set({ smartGuidesEnabled }),

      moveElement: (id, dx, dy) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el,
          ),
          isDirty: true,
        }));
      },

      moveElements: (ids, dx, dy) => {
        if (ids.length === 0) return;
        get().pushHistory("Di chuyển phần tử");
        set((state) => ({
          elements: state.elements.map((el) =>
            ids.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el,
          ),
          isDirty: true,
        }));
      },

      updateElements: (updates) =>
        set((state) => ({
          elements: state.elements.map((el) => {
            const u = updates.find((u) => u.id === el.id);
            return u ? ({ ...el, ...u.changes } as CanvasElement) : el;
          }),
          isDirty: true,
        })),

      updateZIndexes: (ids) => {
        get().pushHistory("Thay đổi thứ tự lớp");
        const { elements } = get();
        const newElements = elements.map((el) => {
          const index = ids.indexOf(el.id);
          if (index === -1) return el;
          return { ...el, zIndex: ids.length - index };
        });
        set({ elements: newElements, isDirty: true });
      },

      groupElements: () => {
        const { elements, selectedElementIds, pushHistory } = get();
        if (selectedElementIds.length < 2) return;

        pushHistory("Nhóm phần tử");

        const selected = elements.filter((el) =>
          selectedElementIds.includes(el.id),
        );

        const minX = Math.min(...selected.map((el) => el.x));
        const minY = Math.min(...selected.map((el) => el.y));
        const maxX = Math.max(...selected.map((el) => el.x + el.width));
        const maxY = Math.max(...selected.map((el) => el.y + el.height));

        const groupId = uuidv4();

        const newGroup: GroupElement = {
          id: groupId,
          type: "group",
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          rotation: 0,
          opacity: 1,
          zIndex: Math.max(...selected.map((el) => el.zIndex)) + 1,
          childIds: selectedElementIds,
        };

        const newElements = elements.map((el) => {
          // 1. If this element is being grouped
          if (selectedElementIds.includes(el.id)) {
            return {
              ...el,
              groupId,
              x: el.x - minX,
              y: el.y - minY,
            } as CanvasElement;
          }

          // 2. If this element is a group that contained one of the selected elements, clean up its childIds
          if (el.type === "group" && el.childIds) {
            const remainingChildren = el.childIds.filter(
              (id) => !selectedElementIds.includes(id),
            );
            if (remainingChildren.length !== el.childIds.length) {
              return {
                ...el,
                childIds: remainingChildren,
              };
            }
          }

          return el;
        });

        set({
          elements: [...newElements, newGroup],
          selectedElementIds: [groupId],
          isDirty: true,
        });
      },

      ungroupElements: () => {
        const { elements, selectedElementIds, pushHistory } = get();
        if (selectedElementIds.length !== 1) return;

        const groupId = selectedElementIds[0];
        const group = elements.find((el) => el.id === groupId) as GroupElement;
        if (!group || group.type !== "group") return;

        pushHistory("Rã nhóm phần tử");

        const newElements = elements
          .filter((el) => el.id !== groupId)
          .map((el) => {
            if (el.groupId === groupId) {
              return {
                ...el,
                groupId: undefined,
                x: el.x + group.x,
                y: el.y + group.y,
              } as CanvasElement;
            }
            return el;
          });

        set({
          elements: newElements,
          selectedElementIds: group.childIds || [],
          isDirty: true,
        });
      },

      setBackgroundColor: (color) => {
        get().pushHistory("Thay đổi màu nền");
        set({ backgroundColor: color, backgroundImage: "", isDirty: true });
      },

      setBackgroundImage: (image) => {
        get().pushHistory("Thay đổi hình nền");
        set({ backgroundImage: image, backgroundColor: "", isDirty: true });
      },
      setBackgroundSize: (size) => {
        get().pushHistory("Thay đổi kích thước nền");
        set({ backgroundSize: size, isDirty: true });
      },
      setBackgroundRepeat: (repeat) => {
        get().pushHistory("Thay đổi lặp nền");
        set({ backgroundRepeat: repeat, isDirty: true });
      },
      setBackgroundPosition: (position) => {
        get().pushHistory("Thay đổi vị trí nền");
        set({ backgroundPosition: position, isDirty: true });
      },
      setBackgroundAttachment: (attachment) => {
        get().pushHistory("Thay đổi kiểu cuộn nền");
        set({ backgroundAttachment: attachment, isDirty: true });
      },
      setBgMusicUrl: (url) => {
        get().pushHistory("Thay đổi nhạc nền");
        set({ bgMusicUrl: url, isDirty: true });
      },
      setMusicVolume: (volume) => set({ musicVolume: volume, isDirty: true }),
      setMusicIcon: (icon) => set({ musicIcon: icon, isDirty: true }),
      setMusicIconColor: (color) =>
        set({ musicIconColor: color, isDirty: true }),
    }),
    {
      name: "editor-storage",
      partialize: (state) => {
        // Exclude history and future from localStorage to avoid QuotaExceededError
        // These can grow very large and exceed the 5MB limit easily
        const { history, future, ...rest } = state;
        return rest;
      },
    },
  ),
);
