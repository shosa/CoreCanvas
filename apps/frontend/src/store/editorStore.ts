import { create } from 'zustand';
import { CanvasElement, LabelConfig } from '@/types';

interface EditorState {
  // Elements
  elements: CanvasElement[];
  selectedId: string | null;

  // Label config
  labelConfig: LabelConfig;

  // Canvas state
  zoom: number;
  showGrid: boolean;

  // History
  history: CanvasElement[][];
  historyIndex: number;

  // Element actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  setElements: (elements: CanvasElement[]) => void;

  // Selection
  setSelectedId: (id: string | null) => void;

  // Label config
  setLabelConfig: (config: Partial<LabelConfig>) => void;

  // Canvas
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;

  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  // Clear
  clearAll: () => void;

  // Z-index
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedId: null,
  labelConfig: { width: 174, height: 76, dpi: 203 },
  zoom: 1,
  showGrid: true,
  history: [[]],
  historyIndex: 0,

  addElement: (element) => {
    set(state => {
      const elements = [...state.elements, element];
      return { elements, selectedId: element.id };
    });
    get().saveHistory();
  },

  updateElement: (id, updates) => {
    set(state => ({
      elements: state.elements.map(el =>
        el.id === id ? { ...el, ...updates } as CanvasElement : el,
      ),
    }));
  },

  deleteElement: (id) => {
    set(state => ({
      elements: state.elements.filter(el => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }));
    get().saveHistory();
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    const newElement = {
      ...element,
      id: crypto.randomUUID(),
      x: element.x + 5,
      y: element.y + 5,
    } as CanvasElement;

    set(s => ({
      elements: [...s.elements, newElement],
      selectedId: newElement.id,
    }));
    get().saveHistory();
  },

  setElements: (elements) => {
    set({ elements });
    get().saveHistory();
  },

  setSelectedId: (id) => set({ selectedId: id }),

  setLabelConfig: (config) => {
    set(state => ({
      labelConfig: { ...state.labelConfig, ...config },
    }));
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(4, zoom)) }),

  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        elements: [...history[newIndex]],
        selectedId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        elements: [...history[newIndex]],
        selectedId: null,
      });
    }
  },

  saveHistory: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.elements]);
      // Keep max 50 history entries
      if (newHistory.length > 50) newHistory.shift();
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  clearAll: () => {
    set({ elements: [], selectedId: null });
    get().saveHistory();
  },

  bringForward: (id) => {
    set(state => {
      const maxZ = Math.max(...state.elements.map(el => el.zIndex), 0);
      return {
        elements: state.elements.map(el =>
          el.id === id ? { ...el, zIndex: maxZ + 1 } as CanvasElement : el,
        ),
      };
    });
  },

  sendBackward: (id) => {
    set(state => {
      const minZ = Math.min(...state.elements.map(el => el.zIndex), 0);
      return {
        elements: state.elements.map(el =>
          el.id === id ? { ...el, zIndex: minZ - 1 } as CanvasElement : el,
        ),
      };
    });
  },
}));
