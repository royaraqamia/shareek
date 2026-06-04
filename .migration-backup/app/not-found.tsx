'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function NotFound() {
  const language = useAppStore(state => state.language);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-slate-900">404</h1>
        <h2 className="text-2xl font-bold text-slate-800">
          {language === 'ar' ? 'الصَّفحة غير موجودة' : 'Page Not Found'}
        </h2>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          {language === 'ar' 
            ? 'عذرًا، لم نتمكَّن من العثور على الصَّفحة التي تبحث عنها. قد تكون قد حُذِفَت أو نُقِلَت.' 
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>
      </div>
      <Link href="/">
        <Button className="gap-2">
          <Home className="w-4 h-4" />
          {language === 'ar' ? 'العودة للرَّئيسيَّة' : 'Return Home'}
        </Button>
      </Link>
    </div>
  );
}
