'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Package, Users, Receipt, DollarSign, TrendingUp, TrendingDown, Zap, Plus, PackagePlus, ClipboardPlus } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
    quickActions: {
      title: { ar: 'الإجراءات السريعة', en: 'Quick Actions' },
      desc: { ar: 'اختصارات مباشرة للبدء فوراً في تسجيل المعاملات والعمليات وتتبعها بقوة.', en: 'Direct shortcuts to start transactions, processes, and tracking instantly.' },
      newTransaction: { ar: 'معاملة مالية جديدة', en: 'New Transaction' },
      newTransactionDesc: { ar: 'تسجيل فاتورة مبيعات أو مشتريات جديدة', en: 'Record a new sales or purchase invoice' },
      addProduct: { ar: 'إضافة منتج / خدمة', en: 'Add Product / Service' },
      addProductDesc: { ar: 'تسجيل بند جديد في مستودع المخازن', en: 'Register a new item in your inventory' },
      addTask: { ar: 'إنشاء مهمة عمل', en: 'Create Business Task' },
      addTaskDesc: { ar: 'إسناد وجدولة عمل جديد للمتابعة', en: 'Assign and schedule a new task to track' }
    },
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
    charts: {
      monthlyTrends: { ar: 'اتجاهات المعاملات الشهرية', en: 'Monthly Transaction Trends' },
      topProducts: { ar: 'أفضل المنتجات مبيعاً', en: 'Top Performing Products' },
      sales: { ar: 'المبيعات', en: 'Sales' },
      purchases: { ar: 'المشتريات', en: 'Purchases' },
      revenue: { ar: 'العائد', en: 'Revenue' },
      noData: { ar: 'لا توجد بيانات كافية', en: 'Not enough data' },
    },
    activity: { ar: 'النشاط الأخير', en: 'Recent Activity' },
    activityDesc: { ar: 'مراقبة إجراءات وتحديثات النظام الحديثة.', en: 'Monitor recent system actions and updates.' },
    createdInvoice: { ar: 'تم إنشاء فاتورة جديدة', en: 'Created new invoice' },
    addedContact: { ar: 'تم إضافة جهة اتصال', en: 'Added new contact' },
    addedProduct: { ar: 'تم إضافة منتج/خدمة', en: 'Added new product/service' },
    noActivity: { ar: 'لا يوجد نشاط بعد', en: 'No activity yet' },
    headers: {
      ref: { ar: 'رقم المرجع', en: 'Ref Number' },
      contact: { ar: 'الجهة', en: 'Contact' },
      total: { ar: 'المبلغ الإجمالي', en: 'Total Amount' },
      date: { ar: 'التاريخ', en: 'Date' }
    }
  };

  const sales = initialTransactions.filter(tx => tx.type === 'SALE');
  const totalSalesValue = sales.reduce((sum, tx) => sum + Number(tx.total_amount), 0);

  const { monthlyTrendsChartData, topProductsChartData, activitiesList, COLORS } = useMemo(() => {
    const monthlyDataMap: Record<string, { month: string, key: string, sales: number, purchases: number }> = {};
    initialTransactions.forEach((tx) => {
      const d = new Date(tx.transaction_date);
      const m = d.toLocaleString('en-US', { month: 'short' });
      const y = d.getFullYear();
      const key = `${y}-${String(d.getMonth()).padStart(2, '0')}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = { month: `${m} ${y}`, key, sales: 0, purchases: 0 };
      }
      const val = Number(tx.total_amount) || 0;
      if (tx.type === 'SALE') {
        monthlyDataMap[key].sales += val;
      } else if (tx.type === 'PURCHASE') {
        monthlyDataMap[key].purchases += val;
      }
    });

    const monthlyTrends = Object.values(monthlyDataMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // last 6 months

    const productSalesMap: Record<string, { name: string, revenue: number }> = {};
    initialTransactions.filter(tx => tx.type === 'SALE').forEach(tx => {
      (tx.transaction_items || []).forEach((item: any) => {
        const pName = item.product?.name || 'Unknown';
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { name: pName, revenue: 0 };
        }
        productSalesMap[pName].revenue += (Number(item.quantity) * Number(item.unit_price)) || 0;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const activities = [
      ...initialTransactions.map(tx => ({
        id: `tx-${tx.id}`,
        type: 'transaction' as const,
        title: tx.reference_number,
        date: new Date(tx.created_at || tx.transaction_date || Date.now()),
      })),
      ...initialContacts.map(c => ({
        id: `contact-${c.id}`,
        type: 'contact' as const,
        title: c.name,
        date: new Date(c.created_at || Date.now()),
      })),
      ...initialProducts.map(p => ({
        id: `product-${p.id}`,
        type: 'product' as const,
        title: p.name,
        date: new Date(p.created_at || Date.now()),
      }))
    ].filter(a => !isNaN(a.date.getTime())).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return {
      monthlyTrendsChartData: monthlyTrends,
      topProductsChartData: topProducts,
      activitiesList: activities,
      COLORS: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
    };
  }, [initialTransactions, initialContacts, initialProducts]);

  return (
    <div className="space-y-10 container max-w-[90rem] mx-auto px-4 md:px-8 py-8">
      {/* Welcome / Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">{t.title[language]}</h1>
        <p className="text-slate-500 text-base md:text-lg font-medium">{t.subtitle[language]}</p>
      </div>

      {/* Quick Actions Card */}
      <Card className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-slate-50/40 border-b border-slate-100/70 px-6 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 border border-amber-100/80 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight">{t.quickActions.title[language]}</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">{t.quickActions.desc[language]}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Action 1: New Transaction */}
            <Link href="/transactions/new" className="group">
              <div className="h-full border border-slate-200/70 hover:border-emerald-500/30 rounded-2xl p-5 bg-white hover:bg-emerald-50/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-right">
                <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-125 transition-transform" />
                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {t.quickActions.newTransaction[language]}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                      {t.quickActions.newTransactionDesc[language]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Action 2: Add Product / Service */}
            <Link href="/inventory?new=true" className="group">
              <div className="h-full border border-slate-200/70 hover:border-blue-500/30 rounded-2xl p-5 bg-white hover:bg-blue-50/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-right">
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-125 transition-transform" />
                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <PackagePlus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {t.quickActions.addProduct[language]}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                      {t.quickActions.addProductDesc[language]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Action 3: Create Task */}
            <Link href="/tasks/create" className="group">
              <div className="h-full border border-slate-200/70 hover:border-violet-500/30 rounded-2xl p-5 bg-white hover:bg-violet-50/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden text-right">
                <div className="absolute top-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl z-0 pointer-events-none group-hover:scale-125 transition-transform" />
                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <ClipboardPlus className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                      {t.quickActions.addTask[language]}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                      {t.quickActions.addTaskDesc[language]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

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

      {/* Charts segment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends Chart */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-black tracking-tight">{t.charts.monthlyTrends[language]}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[22rem]">
            {monthlyTrendsChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                {t.charts.noData[language]}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                    formatter={(value: number) => [value.toLocaleString(), '']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingBottom: '10px' }} />
                  <Bar dataKey="sales" name={t.charts.sales[language]} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="purchases" name={t.charts.purchases[language]} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-black tracking-tight">{t.charts.topProducts[language]}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[22rem]">
            {topProductsChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                {t.charts.noData[language]}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="revenue"
                    nameKey="name"
                    stroke="none"
                  >
                    {topProductsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                    formatter={(value: number) => [value.toLocaleString(), t.charts.revenue[language]]}
                  />
                  <Legend verticalAlign="middle" layout="vertical" align="right" iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
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
              <div className="py-12 text-center text-muted-foreground text-sm">
                {t.noTransactions[language]}
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/80 text-muted-foreground font-semibold text-start">
                        <th className="py-4 px-6 text-start whitespace-nowrap">{t.headers.ref[language]}</th>
                        <th className="py-4 px-6 text-start whitespace-nowrap">{t.headers.contact[language]}</th>
                        <th className="py-4 px-6 text-end whitespace-nowrap">{t.headers.total[language]}</th>
                        <th className="py-4 px-6 text-end whitespace-nowrap">{t.headers.date[language]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialTransactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="border-b border-border/60 hover:bg-secondary/50 transition-colors group">
                          <td className="py-4 px-6 font-bold flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
                              {tx.type === 'SALE' ? (
                                <TrendingUp className="w-4 h-4 shrink-0" />
                              ) : (
                                <TrendingDown className="w-4 h-4 shrink-0" />
                              )}
                            </div>
                            <span className="text-foreground font-mono">{tx.reference_number}</span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground font-medium">{tx.contacts?.name || '-'}</td>
                          <td className="py-4 px-6 text-end font-bold text-foreground font-mono">
                            {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-end text-muted-foreground text-xs font-mono font-medium">
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden p-4 space-y-3">
                  {initialTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="border border-border/60 rounded-xl p-3 bg-card hover:border-primary/50 transition-all flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-md ${tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
                            {tx.type === 'SALE' ? (
                              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                            )}
                          </div>
                          <span className="text-foreground font-bold font-mono text-sm">{tx.reference_number}</span>
                        </div>
                        <span className="font-bold text-foreground font-mono text-sm">
                          {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-medium">{tx.contacts?.name || '-'}</span>
                        <span className="font-mono">{new Date(tx.transaction_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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

      {/* Activity Feed Segment */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-5">
            <CardTitle className="text-xl font-black tracking-tight">{t.activity[language]}</CardTitle>
            <CardDescription className="text-sm font-medium">{t.activityDesc[language]}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activitiesList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                {t.noActivity[language]}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {activitiesList.map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'transaction' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : activity.type === 'contact'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {activity.type === 'transaction' ? (
                          <Receipt className="w-5 h-5 shrink-0" />
                        ) : activity.type === 'contact' ? (
                          <Users className="w-5 h-5 shrink-0" />
                        ) : (
                          <Package className="w-5 h-5 shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          {activity.type === 'transaction' ? t.createdInvoice[language] : activity.type === 'contact' ? t.addedContact[language] : t.addedProduct[language]}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                          {activity.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-500">
                      {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
