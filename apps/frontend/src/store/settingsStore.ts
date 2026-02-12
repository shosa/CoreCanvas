import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  printerHost: string;
  printerPort: number;
  unit: 'mm' | 'inch';
  snapToGrid: boolean;
  gridSize: number; // mm
  setPrinterHost: (host: string) => void;
  setPrinterPort: (port: number) => void;
  setUnit: (unit: 'mm' | 'inch') => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      printerHost: '192.168.3.44',
      printerPort: 6101,
      unit: 'mm',
      snapToGrid: true,
      gridSize: 2,

      setPrinterHost: (host) => set({ printerHost: host }),
      setPrinterPort: (port) => set({ printerPort: port }),
      setUnit: (unit) => set({ unit }),
      toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
      setGridSize: (size) => set({ gridSize: size }),
    }),
    { name: 'corecanvas-settings' },
  ),
);
