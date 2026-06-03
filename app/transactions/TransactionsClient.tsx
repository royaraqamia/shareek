'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Receipt, TrendingUp, TrendingDown, Eye, WifiOff } from 'lucide-react';

interface TransactionsClientProps {
  initialTransactions: any[];
  contacts: any[];
  products: any[];
}

export function TransactionsClient({ initialTransactions, contacts, products }: TransactionsClientProps) {
  const { transactions: offlineTransactions, setTransactions: setOfflineTransactions } = useOfflineDataStore();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            {t.title[language]}
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
          </h1>
          <p className="text-slate-500 text-sm">
            {t.subtitle[language]}
            {isOfflineMode && <span className="text-amber-500 font-bold mr-1">(وضع عدم الاتصال)</span>}
          </p>
        </div>
        <Button className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium" onClick={() => router.push('/transactions/new')}>
          <Plus className="w-4 h-4 text-white" />
          {t.addTransaction[language]}
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800">{t.emptyTitle[language]}</h3>
              <p className="text-sm text-slate-400">{t.emptyDesc[language]}</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.headers.ref[language]}</TableHead>
                <TableHead>{t.headers.type[language]}</TableHead>
                <TableHead>{t.headers.contact[language]}</TableHead>
                <TableHead className="text-end">{t.headers.subtotal[language]}</TableHead>
                <TableHead className="text-end">{t.headers.total[language]}</TableHead>
                <TableHead className="text-end">{t.headers.date[language]}</TableHead>
                <TableHead className="w-[100px] text-end"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.id}
                  className="cursor-pointer hover:bg-slate-50/75 transition-colors group"
                  onClick={() => router.push(`/transactions/${tx.id}`)}
                >
                  <TableCell className="font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      {tx.type === 'SALE' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span>{tx.reference_number}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      tx.type === 'SALE' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {t.types[tx.type as 'SALE' | 'PURCHASE'][language]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">{tx.contacts?.name || '-'}</TableCell>
                  <TableCell className="text-end text-slate-500 font-mono text-sm">
                    {Number(tx.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-end font-bold text-slate-900 font-mono text-sm">
                    {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-end text-slate-400 text-xs font-mono">
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
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
