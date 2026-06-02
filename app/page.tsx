'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, Receipt, LayoutDashboard, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const language = useAppStore(state => state.language);

  const t = {
    welcome: { ar: 'مرحباً بك في شريك ERP', en: 'Welcome to Shareek ERP' },
    subtitle: { ar: 'نظام إدارة شامل متكامل لمؤسستك ومخزونك ومعاملاتك.', en: 'Comprehensive management system integrated for your organization, inventory, and transactions.' },
    getStarted: { ar: 'ابدأ الآن', en: 'Get Started' },
    stats: { ar: 'نظرة عامة على الوحدات الكبرى', en: 'Core Module Overview' },
  };

  const moduleTranslations = {
    dashboard: {
      title: { ar: 'لوحة القيادة', en: 'Dashboard' },
      desc: { ar: 'مراقبة المؤشرات المالية العامة وحالة المبيعات والمشتريات.', en: 'Monitor financial indicators, sales, and purchase metrics.' }
    },
    inventory: {
      title: { ar: 'المخزون والمنتجات', en: 'Inventory & Products' },
      desc: { ar: 'إدارة المنتجات والخدمات والمستوى الفعلي اللحظي للمخزون.', en: 'Manage products, services, and live stock count.' }
    },
    transactions: {
      title: { ar: 'المبيعات والمشتريات', en: 'Transactions' },
      desc: { ar: 'إنشاء الفواتير، إدارة الخصومات، والالتزام بالقواعد المالية والضريبية.', en: 'Create invoices, handle taxation, client & supplier actions.' }
    },
    contacts: {
      title: { ar: 'جهات الاتصال', en: 'Contacts' },
      desc: { ar: 'متابعة تفاصيل العملاء والموردين وربطهم بالمعاملات المالية.', en: 'Track customers and suppliers, linking them to core metrics.' }
    }
  };

  const currentT = (key: keyof typeof t) => t[key][language];

  return (
    <div className="container max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col justify-center items-center min-h-[calc(100vh-3.5rem)] space-y-12">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight border-none">
          {currentT('welcome')}
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          {currentT('subtitle')}
        </p>
        <div className="flex gap-4 items-center justify-center pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 px-8 font-semibold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white">
              {currentT('getStarted')}
              {language === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full pt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{currentT('stats')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard" className="block group">
            <Card className="h-full border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-100 transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {moduleTranslations.dashboard.title[language]}
                </CardTitle>
                <CardDescription className="text-sm">
                  {moduleTranslations.dashboard.desc[language]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/inventory" className="block group">
            <Card className="h-full border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-100 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                  {moduleTranslations.inventory.title[language]}
                </CardTitle>
                <CardDescription className="text-sm">
                  {moduleTranslations.inventory.desc[language]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/transactions" className="block group">
            <Card className="h-full border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 mb-2 group-hover:bg-violet-100 transition-colors">
                  <Receipt className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-violet-600 transition-colors">
                  {moduleTranslations.transactions.title[language]}
                </CardTitle>
                <CardDescription className="text-sm">
                  {moduleTranslations.transactions.desc[language]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/contacts" className="block group">
            <Card className="h-full border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md cursor-pointer">
              <CardHeader className="space-y-1">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-2 group-hover:bg-amber-100 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                  {moduleTranslations.contacts.title[language]}
                </CardTitle>
                <CardDescription className="text-sm">
                  {moduleTranslations.contacts.desc[language]}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
