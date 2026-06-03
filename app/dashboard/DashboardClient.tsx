'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Package, Users, Receipt, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardClientProps {
  initialProducts: any[];
  initialTransactions: any[];
  initialContacts: any[];
}

export function DashboardClient({ initialProducts, initialTransactions, initialContacts }: DashboardClientProps) {
  const language = useAppStore(state => state.language);

  const t = {
    title: { ar: 'لوحة القيادة', en: 'Dashboard' },
    subtitle: { ar: 'نظرة عامة على أداء ومخزون المؤسسة الحالية.', en: 'Overview of current organization performance and inventory.' },
    metrics: {
      products: { ar: 'إجمالي المنتجات', en: 'Total Products' },
      transactions: { ar: 'المعاملات المالية', en: 'Transactions' },
      contacts: { ar: 'جهات الاتصال', en: 'Contacts' },
      revenue: { ar: 'إجمالي المبيعات', en: 'Total Sales' },
    },
    recent: { ar: 'آخر المعاملات', en: 'Recent Transactions' },
    recentDesc: { ar: 'أحدث العمليات التي تم تسجيلها في النظام مؤخراً.', en: 'Latest recorded system transactions.' },
    noTransactions: { ar: 'لا توجد معاملات بعد', en: 'No transactions yet' },
    type: {
      SALE: { ar: 'بيع', en: 'Sale' },
      PURCHASE: { ar: 'شراء', en: 'Purchase' }
    },
    headers: {
      ref: { ar: 'رقم المرجع', en: 'Ref Number' },
      contact: { ar: 'الجهة', en: 'Contact' },
      total: { ar: 'المبلغ الإجمالي', en: 'Total Amount' },
      date: { ar: 'التاريخ', en: 'Date' }
    }
  };

  const sales = initialTransactions.filter(tx => tx.type === 'SALE');
  const totalSalesValue = sales.reduce((sum, tx) => sum + Number(tx.total_amount), 0);

  return (
    <div className="space-y-10 container max-w-[90rem] mx-auto px-4 md:px-8 py-8">
      {/* Welcome / Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">{t.title[language]}</h1>
        <p className="text-slate-500 text-base md:text-lg font-medium">{t.subtitle[language]}</p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative overflow-hidden">
            <CardTitle className="text-sm font-bold text-slate-600 z-10">{t.metrics.products[language]}</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 z-10 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100/50">
              <Package className="w-5 h-5" />
            </div>
            {/* Soft background glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl z-0 transition-opacity group-hover:opacity-100 opacity-50" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{initialProducts.length}</div>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              {language === 'ar' ? 'منتجات وخدمات نشطة' : 'Active items & services'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-violet-500/20 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative overflow-hidden">
            <CardTitle className="text-sm font-bold text-slate-600 z-10">{t.metrics.transactions[language]}</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 z-10 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-violet-100/50">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl z-0 transition-opacity group-hover:opacity-100 opacity-50" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{initialTransactions.length}</div>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
              {language === 'ar' ? 'معاملة مسجلة' : 'Recorded invoices'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-amber-500/20 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative overflow-hidden">
            <CardTitle className="text-sm font-bold text-slate-600 z-10">{t.metrics.contacts[language]}</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 z-10 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-amber-100/50">
              <Users className="w-5 h-5" />
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl z-0 transition-opacity group-hover:opacity-100 opacity-50" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-900 tracking-tight">{initialContacts.length}</div>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {language === 'ar' ? 'عملاء وموردين معتمدين' : 'Active clients & suppliers'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 rounded-2xl bg-white/50 backdrop-blur-sm group">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative overflow-hidden">
            <CardTitle className="text-sm font-bold text-slate-600 z-10">{t.metrics.revenue[language]}</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 z-10 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-emerald-100/50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl z-0 transition-opacity group-hover:opacity-100 opacity-50" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
              {totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {language === 'ar' ? 'ريال سعودي / درهم إجمالي' : 'SAR / AED total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest transactions segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-black tracking-tight">{t.recent[language]}</CardTitle>
            <CardDescription className="text-sm font-medium">{t.recentDesc[language]}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {initialTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                {t.noTransactions[language]}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold text-start">
                      <th className="py-4 px-6 text-start whitespace-nowrap">{t.headers.ref[language]}</th>
                      <th className="py-4 px-6 text-start whitespace-nowrap">{t.headers.contact[language]}</th>
                      <th className="py-4 px-6 text-end whitespace-nowrap">{t.headers.total[language]}</th>
                      <th className="py-4 px-6 text-end whitespace-nowrap">{t.headers.date[language]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialTransactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {tx.type === 'SALE' ? (
                              <TrendingUp className="w-4 h-4 shrink-0" />
                            ) : (
                              <TrendingDown className="w-4 h-4 shrink-0" />
                            )}
                          </div>
                          <span className="text-slate-800">{tx.reference_number}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{tx.contacts?.name || '-'}</td>
                        <td className="py-4 px-6 text-end font-bold text-slate-900 font-mono">
                          {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-end text-slate-400 text-xs font-mono font-medium">
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card / Summary breakdown */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-black tracking-tight">
              {language === 'ar' ? 'التوزيع المالي الحالي' : 'Financial Breakdown'}
            </CardTitle>
            <CardDescription className="text-sm font-medium">
              {language === 'ar' ? 'مقارنة المبيعات الحالية بالمشتريات' : 'Comparison of sales and purchases'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-emerald-700 flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <TrendingUp className="w-4 h-4" />
                    {language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}
                  </span>
                  <span className="font-bold text-emerald-800 font-mono text-lg tracking-tight">
                    {totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-blue-700 flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    <TrendingDown className="w-4 h-4" />
                    {language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}
                  </span>
                  <span className="font-bold text-blue-800 font-mono text-lg tracking-tight">
                    {initialTransactions
                      .filter(tx => tx.type === 'PURCHASE')
                      .reduce((sum, tx) => sum + Number(tx.total_amount), 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ 
                      width: `${Math.min(
                        100, 
                        (initialTransactions.filter(tx => tx.type === 'PURCHASE').reduce((sum, tx) => sum + Number(tx.total_amount), 0) / (totalSalesValue || 1)) * 100
                      )}%` 
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10 rounded-xl p-5 text-sm font-medium text-slate-700 leading-relaxed shadow-sm">
              {language === 'ar' 
                ? 'ملاحظة: يمكنك إدارة المخزون والمعاملات مباشرة عبر نوافذ التصفح في شريط القائمة العلوي.' 
                : 'Note: You can manage inventory and transactions directly via navigation items in the top bar.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
