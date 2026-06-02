import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ar';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: () => 'ltr' | 'rtl';
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'ar', // Default Arabic
      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof document !== 'undefined') {
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.lang = lang;
        }
      },
      dir: () => (get().language === 'ar' ? 'rtl' : 'ltr'),
    }),
    {
      name: 'shareek-app-settings',
    }
  )
);
