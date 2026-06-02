import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: () => 'rtl';
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
    }),
    {
      name: 'shareek-app-settings',
    }
  )
);
