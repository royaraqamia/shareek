'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Receipt, LayoutDashboard, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const language = useAppStore(state => state.language);

  const t = {
    welcome: { ar: 'مرحبًا بك في شَريك' },
    subtitle: { ar: 'نظام إدارة شامل متكامل لمشروعك أو شركتك.' },
    getStarted: { ar: 'ابدأ الآن' },
    stats: { ar: 'نظرة عامَّة' },
  };

  const moduleTranslations = {
    dashboard: {
      title: { ar: 'لوحة القيادة' },
      desc: { ar: 'مراقبة المؤشِّرات الماليَّة العامَّة وحالة المبيعات والمشتريات.' }
    },
    inventory: {
      title: { ar: 'المنتجات والخدمات' },
      desc: { ar: 'إدارة المنتجات والخدمات والمستوى الفعلي اللحظي للمخزون.' }
    },
    transactions: {
      title: { ar: 'المبيعات والمشتريات' },
      desc: { ar: 'إنشاء الفواتير، إدارة الخصومات، والالتزام بالقواعد الماليَّة والضَّريبيَّة.' }
    },
    contacts: {
      title: { ar: 'العلاقات' },
      desc: { ar: 'متابعة تفاصيل الزَّبائن والمورِّدين وربطهم بالمعاملات الماليَّة.' }
    }
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
            مستقبل الإدارة الذكية
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] pb-2">
            {currentT('welcome')}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
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

        <div className="w-full pt-12 z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{currentT('stats')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <Link href="/dashboard" className="block group">
            <Card className="h-full border border-slate-200/50 bg-white/60 backdrop-blur-3xl hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 cursor-pointer rounded-2xl overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-4 p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50/80 flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100/50">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                    {moduleTranslations.dashboard.title[language]}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                    {moduleTranslations.dashboard.desc[language]}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/inventory" className="block group">
            <Card className="h-full border border-slate-200/50 bg-white/60 backdrop-blur-3xl hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 cursor-pointer rounded-2xl overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-4 p-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-emerald-100/50">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                    {moduleTranslations.inventory.title[language]}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                    {moduleTranslations.inventory.desc[language]}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/transactions" className="block group">
            <Card className="h-full border border-slate-200/50 bg-white/60 backdrop-blur-3xl hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1 cursor-pointer rounded-2xl overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-4 p-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-50/80 flex items-center justify-center text-violet-600 mb-2 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-violet-100/50">
                  <Receipt className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                    {moduleTranslations.transactions.title[language]}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                    {moduleTranslations.transactions.desc[language]}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/contacts" className="block group">
            <Card className="h-full border border-slate-200/50 bg-white/60 backdrop-blur-3xl hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer rounded-2xl overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-4 p-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-50/80 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-amber-100/50">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                    {moduleTranslations.contacts.title[language]}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                    {moduleTranslations.contacts.desc[language]}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
