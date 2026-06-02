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
    <div className="space-y-8">
      {/* Welcome / Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{t.title[language]}</h1>
        <p className="text-slate-500 text-sm md:text-base">{t.subtitle[language]}</p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-100 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">{t.metrics.products[language]}</CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{initialProducts.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar' ? 'منتجات وخدمات نشطة' : 'Active items & services'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">{t.metrics.transactions[language]}</CardTitle>
            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{initialTransactions.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar' ? 'معاملة مسجلة' : 'Recorded invoices'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">{t.metrics.contacts[language]}</CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{initialContacts.length}</div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar' ? 'عملاء وموردين معتمدين' : 'Active clients & suppliers'}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">{t.metrics.revenue[language]}</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {totalSalesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ar' ? 'ريال سعودي / درهم إجمالي' : 'SAR / AED total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest transactions segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 border border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t.recent[language]}</CardTitle>
            <CardDescription className="text-xs">{t.recentDesc[language]}</CardDescription>
          </CardHeader>
          <CardContent>
            {initialTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                {t.noTransactions[language]}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-400 font-medium text-start">
                      <th className="py-3 px-2 text-start font-medium">{t.headers.ref[language]}</th>
                      <th className="py-3 px-2 text-start font-medium">{t.headers.contact[language]}</th>
                      <th className="py-3 px-2 text-end font-medium">{t.headers.total[language]}</th>
                      <th className="py-3 px-2 text-end font-medium">{t.headers.date[language]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialTransactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-2 font-semibold flex items-center gap-2">
                          {tx.type === 'SALE' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                          <span>{tx.reference_number}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">{tx.contacts?.name || '-'}</td>
                        <td className="py-3 px-2 text-end font-bold text-slate-900">
                          {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2 text-end text-slate-400 text-xs">
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
        <Card className="border border-slate-100 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              {language === 'ar' ? 'التوزيع المالي الحالي' : 'Financial Breakdown'}
            </CardTitle>
            <CardDescription className="text-xs">
              {language === 'ar' ? 'مقارنة المبيعات الحالية بالمشتريات' : 'Comparison of sales and purchases'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            {/* SVG Visual Progress Circles or Bar indicators */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-600 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'}
                  </span>
                  <span className="font-bold text-blue-700">
                    {initialTransactions
                      .filter(tx => tx.type === 'PURCHASE')
                      .reduce((sum, tx) => sum + Number(tx.total_amount), 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
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

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-xs text-slate-500 mt-4">
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
