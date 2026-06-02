'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggler() {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 shrink-0">
      <Globe className="w-4 h-4" />
      <span>{language === 'ar' ? 'English' : 'عربي'}</span>
    </Button>
  );
}
