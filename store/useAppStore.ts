import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar';
export type Theme = 'light' | 'dark';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: () => 'rtl';
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'ar', // Strictly Arabic
      setLanguage: (lang) => {
        set({ language: 'ar' });
        if (typeof document !== 'undefined') {
          document.documentElement.dir = 'rtl';
          document.documentElement.lang = 'ar';
        }
      },
      dir: () => 'rtl',
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'shareek-app-settings',
    }
  )
);
