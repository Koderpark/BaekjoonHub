import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  isEnabled: boolean;
  isDarkMode: boolean;
  isSyncing: boolean;
  lastSync: string | null;
  setEnabled: (isEnabled: boolean) => void;
  setDarkMode: (isDarkMode: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSync: (lastSync: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        isEnabled: true,
        isDarkMode: false,
        isSyncing: false,
        lastSync: null,
        setEnabled: (isEnabled) => set({ isEnabled }),
        setDarkMode: (isDarkMode) => set({ isDarkMode }),
        setSyncing: (isSyncing) => set({ isSyncing }),
        setLastSync: (lastSync) => set({ lastSync }),
      }),
      {
        name: 'baekjoonhub-app-storage',
      }
    )
  )
);
