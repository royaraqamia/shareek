'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const language = useAppStore(state => state.language);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  if (!mounted) {
    return <div className="min-h-screen opacity-0" />; // hide until initialized to prevent hydration mismatch for RTL
  }

  return (
    <div className={`font-sans antialiased bg-slate-50 relative ${language === 'ar' ? 'font-arabic' : 'font-english'}`}>
      <main className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
