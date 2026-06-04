'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Receipt, TrendingUp, TrendingDown, Eye, WifiOff, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TransactionsClientProps {
  initialTransactions: any[];
  contacts: any[];
  products: any[];
}

export function TransactionsClient({ initialTransactions, contacts, products }: TransactionsClientProps) {
  const { transactions: offlineTransactions, setTransactions: setOfflineTransactions } = useOfflineDataStore();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SALE' | 'PURCHASE'>('ALL');
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (tx.contacts?.name && tx.contacts.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'SALE') return matchesSearch && tx.type === 'SALE';
    if (filterType === 'PURCHASE') return matchesSearch && tx.type === 'PURCHASE';
    return matchesSearch;
  });

  useEffect(() => {
    if (navigator.onLine) {
      setIsOfflineMode(false);
      setOfflineTransactions(initialTransactions);
      setTransactions(initialTransactions);
    } else {
      setIsOfflineMode(true);
      setTransactions(offlineTransactions);
    }
  }, [initialTransactions, navigator.onLine, setOfflineTransactions]);

  const t = {
    title: { ar: 'المعاملات المالية', en: 'Transactions' },
    subtitle: { ar: 'إدارة فواتير المبيعات وفواتير المشتريات والمدفوعات.', en: 'Manage sales invoices, purchase invoices, and receipts.' },
    addTransaction: { ar: 'معاملة جديدة', en: 'New Invoice / Transaction' },
    emptyTitle: { ar: 'لا توجد معاملات بعد', en: 'No transactions found' },
    emptyDesc: { ar: 'قم بتسجيل عملية بيع أو شراء جديدة للبدء.', en: 'Record a new purchase or sale to get started.' },
    headers: {
      ref: { ar: 'رقم المرجع', en: 'Ref Number' },
      type: { ar: 'النوع', en: 'Type' },
      contact: { ar: 'الجهة / العميل / المورد', en: 'Contact / Client / Supplier' },
      subtotal: { ar: 'المجموع الفرعي', en: 'Subtotal' },
      total: { ar: 'الإجمالي (مع الضريبة)', en: 'Total (Incl. Tax)' },
      date: { ar: 'التاريخ', en: 'Date' }
    },
    types: {
      SALE: { ar: 'فاتورة مبيعات', en: 'Sales Invoice' },
      PURCHASE: { ar: 'فاتورة مشتريات', en: 'Purchase Invoice' }
    }
  };

  return (
    <div className="space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
              <Receipt className="w-7 h-7" />
            </div>
            {t.title[language]}
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            {t.subtitle[language]}
            {isOfflineMode && <span className="text-amber-500 font-bold mr-2 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 text-xs">(وضع عدم الاتصال)</span>}
          </p>
        </div>
        <Button size="lg" className="gap-2 cursor-pointer bg-primary shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-white font-bold rounded-xl transition-all h-12 px-6 w-full sm:w-auto" onClick={() => router.push('/transactions/new')}>
          <Plus className="w-5 h-5 text-white" />
          {t.addTransaction[language]}
        </Button>
      </div>

      {/* Elegant Search & Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث برقم المرجع أو اسم الجهة...' : 'Search by reference or contact name...'}
            className="pr-10 pl-4 h-11 text-right bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-end">
          <Button
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الكل' : 'All'} ({transactions.length})
          </Button>
          <Button
            variant={filterType === 'SALE' ? 'default' : 'outline'}
            onClick={() => setFilterType('SALE')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'فواتير المبيعات' : 'Sales Invoices'} ({transactions.filter(t => t.type === 'SALE').length})
          </Button>
          <Button
            variant={filterType === 'PURCHASE' ? 'default' : 'outline'}
            onClick={() => setFilterType('PURCHASE')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'فواتير المشتريات' : 'Purchase Invoices'} ({transactions.filter(t => t.type === 'PURCHASE').length})
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl overflow-hidden shadow-sm">
        {transactions.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-400">
              <Receipt className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.emptyTitle[language]}</h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">{t.emptyDesc[language]}</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-400">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-800">
                {language === 'ar' ? 'لا توجد معاملات مطابقة' : 'No matching transactions'}
              </h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">
                {language === 'ar' ? 'جرب البحث بكلمات أخرى أو إعادة تهيئة عوامل التصفية.' : 'Try searching with other keywords or reset your filters.'}
              </p>
            </div>
            <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4" onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}>
              {language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters'}
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200">
                <TableHead className="font-bold text-slate-600 h-12 px-6 text-right">{t.headers.ref[language]}</TableHead>
                <TableHead className="font-bold text-slate-600 px-6 text-right">{t.headers.type[language]}</TableHead>
                <TableHead className="font-bold text-slate-600 px-6 text-right">{t.headers.contact[language]}</TableHead>
                <TableHead className="text-left font-bold text-slate-600 px-6">{t.headers.subtotal[language]}</TableHead>
                <TableHead className="text-left font-bold text-slate-600 px-6">{t.headers.total[language]}</TableHead>
                <TableHead className="text-left font-bold text-slate-600 px-6">{t.headers.date[language]}</TableHead>
                <TableHead className="w-[100px] text-left px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow 
                  key={tx.id}
                  className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/40 transition-colors group h-16"
                  onClick={() => router.push(`/transactions/${tx.id}`)}
                >
                  <TableCell className="font-bold text-slate-900 px-6 text-right">
                    <span className="flex items-center gap-3 justify-start">
                      <div className={`p-1.5 rounded-md ${tx.type === 'SALE' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {tx.type === 'SALE' ? (
                          <TrendingUp className="w-4 h-4 shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 shrink-0" />
                        )}
                      </div>
                      <span className="font-mono text-[15px]">{tx.reference_number}</span>
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border ${
                      tx.type === 'SALE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ml-1.5 ${tx.type === 'SALE' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      {t.types[tx.type as 'SALE' | 'PURCHASE'][language]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium px-6 text-right">{tx.contacts?.name || '-'}</TableCell>
                  <TableCell className="text-left text-slate-500 font-mono text-[15px] font-semibold px-6">
                    {Number(tx.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-left font-black text-slate-900 font-mono text-[15px] px-6">
                    {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-left text-slate-400 text-sm font-mono font-medium px-6">
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-left px-6">
                    <div className="flex justify-start opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-white shadow-sm border-slate-200 text-primary hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
