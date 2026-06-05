'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Receipt, LayoutDashboard, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const language = useAppStore(state => state.language);

  const t = {
    welcome: { ar: 'السَّلام عليكم، أهلًا بك في شَريك', en: 'Hello, Welcome to Shareek' },
    subtitle: { ar: 'نظام إدارة شامل متكامل لمشروعك.', en: 'Comprehensive integrated management system for your project.' },
    getStarted: { ar: 'ابدأ الآن', en: 'Get Started' },
  };

  const currentT = (key: keyof typeof t) => t[key][language];

  return (
    <div className="relative isolate min-h-[calc(100vh-4.5rem)] flex flex-col justify-center overflow-hidden bg-background">
      {/* Background Decorative Gradient/Blur */}
      <div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
        aria-hidden="true"
      >
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#90c0ff] to-[#4f46e5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{
            clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          }}
        />
      </div>

      <div className="container max-w-[80rem] mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col justify-center items-center space-y-16">
        <div className="text-center space-y-8 max-w-3xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            مستقبل الإدارة الذَّكيَّة
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-slate-50 leading-[1.1] pb-2">
            {currentT('welcome')}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto">
            {currentT('subtitle')}
          </p>
          <div className="flex gap-4 items-center justify-center pt-6">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 gap-3 px-10 rounded-full font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/95 text-white transition-all hover:scale-105 active:scale-95 text-lg">
                {currentT('getStarted')}
                {language === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
