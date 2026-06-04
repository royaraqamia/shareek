'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { Plus, Receipt, TrendingUp, TrendingDown, Eye, WifiOff, Search, Download, Trash2, SlidersHorizontal, Check, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/utils/toast';
import { bulkDeleteTransactionsAction, bulkUpdateTransactionsPaymentAction } from '@/features/transactions/actions';

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const res = await bulkDeleteTransactionsAction(selectedIds);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم الحذف بنجاح!' : 'Deleted successfully!');
        const updated = transactions.filter(t => !selectedIds.includes(t.id));
        setTransactions(updated);
        setOfflineTransactions(updated);
        setSelectedIds([]);
        setIsDeleteConfirmOpen(false);
      } else {
        toast.error(res.message || 'فشلت عملية الحذف');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkUpdatePayment = async (status: 'PAID' | 'PARTIAL' | 'UNPAID') => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateTransactionsPaymentAction(selectedIds, status);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم التحديث بنجاح!' : 'Updated successfully!');
        const updated = transactions.map(t => selectedIds.includes(t.id) ? { ...t, payment_status: status } : t);
        setTransactions(updated);
        setOfflineTransactions(updated);
        setSelectedIds([]);
      } else {
        toast.error(res.message || 'فشل التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating');
    } finally {
      setIsBulkUpdating(false);
    }
  };


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

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error(
        language === 'ar' 
          ? 'لا توجد معاملات مصفاة لتصديرها!' 
          : 'No filtered transactions to export!'
      );
      return;
    }

    // Set headers bilingually or matches the active system language
    const headersAr = ['رقم المرجع', 'نوع الفاتورة', 'الجهة / العميل / المورد', 'المجموع الفرعي', 'الإجمالي (شامل الضريبة)', 'التاريخ (مُنسَّق)'];
    const headersEn = ['Reference Number', 'Invoice Type', 'Contact / Client / Supplier', 'Subtotal', 'Total (Incl. Tax)', 'Date'];
    const headers = language === 'ar' ? headersAr : headersEn;

    // Map records to rows
    const rows = filteredTransactions.map(tx => {
      const typeLabel = tx.type === 'SALE' 
        ? (language === 'ar' ? 'فاتورة مبيعات' : 'Sales Invoice')
        : (language === 'ar' ? 'فاتورة مشتريات' : 'Purchase Invoice');
      
      const contactName = tx.contacts?.name || '-';
      const subtotalVal = Number(tx.subtotal).toFixed(2);
      const totalVal = Number(tx.total_amount).toFixed(2);
      const dateVal = new Date(tx.transaction_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

      return [
        tx.reference_number || '',
        typeLabel,
        contactName,
        subtotalVal,
        totalVal,
        dateVal
      ];
    });

    // Construct spreadsheet CSV string, escape double quotes safely
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Create the Blob with standard UTF-8 Byte Order Mark (BOM) to guarantee clean Arabic character encoding in Microsoft Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Process download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterLabel = filterType === 'SALE' ? '_Sales' : filterType === 'PURCHASE' ? '_Purchases' : '';
    link.setAttribute('download', `shareek_transactions_${dateStr}${filterLabel}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      language === 'ar'
        ? `تمَّ تصدير ${filteredTransactions.length} معاملة بنجاح! 📊`
        : `Exported ${filteredTransactions.length} transactions successfully! 📊`
    );
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
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant="outline"
            size="lg" 
            className="gap-2 cursor-pointer border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all h-12 px-5 w-full sm:w-auto shadow-sm"
            onClick={handleExport}
          >
            <Download className="w-5 h-5 text-slate-500" />
            {language === 'ar' ? 'تصدير التقرير (Excel)' : 'Export Report (Excel)'}
          </Button>

          <Button size="lg" className="gap-2 cursor-pointer bg-primary shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-white font-bold rounded-xl transition-all h-12 px-6 w-full sm:w-auto" onClick={() => router.push('/transactions/new')}>
            <Plus className="w-5 h-5 text-white" />
            {t.addTransaction[language]}
          </Button>
        </div>
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

      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {language === 'ar' ? `تم تحديد ${selectedIds.length} عنصر:` : `Selected ${selectedIds.length} items:`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            {/* Set Paid */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdatePayment('PAID')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'ar' ? 'تعيين كمدفوع بالكامل' : 'Set as Fully Paid'}
            </Button>

            {/* Set Partial */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdatePayment('PARTIAL')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              {language === 'ar' ? 'تعيين كمدفوع جزئياً' : 'Set as Partially Paid'}
            </Button>

            {/* Set Unpaid */}
            <Button 
              size="sm" 
              variant="outline"
              disabled={isBulkUpdating}
              onClick={() => handleBulkUpdatePayment('UNPAID')}
              className="gap-1.5 h-9 rounded-lg border-amber-500/30 bg-white/50 text-amber-900 font-bold text-xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-red-650" />
              {language === 'ar' ? 'تعيين كغير مدفوع' : 'Set as Unpaid'}
            </Button>

            {/* Delete button */}
            <Button 
              size="sm" 
              variant="destructive" 
              disabled={isBulkDeleting}
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="gap-1.5 h-9 rounded-lg font-bold text-xs hover:bg-rose-600/90 cursor-pointer"
            >
              {isBulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {language === 'ar' ? 'حذف المحدد' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      )}

      <DangerConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.length}
        isLoading={isBulkDeleting}
        language={language}
      />

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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[50px] px-4 text-center font-bold text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredTransactions.map(tx => tx.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-input"
                      />
                    </TableHead>
                    <TableHead className="font-bold text-muted-foreground h-12 px-6 text-right">{t.headers.ref[language]}</TableHead>
                    <TableHead className="font-bold text-muted-foreground px-6 text-right">{t.headers.type[language]}</TableHead>
                    <TableHead className="font-bold text-muted-foreground px-6 text-right">{t.headers.contact[language]}</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground px-6">{t.headers.subtotal[language]}</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground px-6">{t.headers.total[language]}</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground px-6">{t.headers.date[language]}</TableHead>
                    <TableHead className="w-[100px] text-left px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const isSelected = selectedIds.includes(tx.id);
                    return (
                      <TableRow 
                        key={tx.id}
                        className={`cursor-pointer border-b border-border hover:bg-secondary/30 transition-colors group h-16 ${
                          isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                        }`}
                        onClick={() => router.push(`/transactions/${tx.id}`)}
                      >
                        <TableCell className="w-[50px] px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, tx.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== tx.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-input"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-foreground px-6 text-right">
                          <span className="flex items-center gap-3 justify-start">
                            <div className={`p-1.5 rounded-md ${tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'}`}>
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
                            tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/20' : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ml-1.5 ${tx.type === 'SALE' ? 'bg-emerald-500' : 'bg-primary'}`} />
                            {t.types[tx.type as 'SALE' | 'PURCHASE'][language]}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-medium px-6 text-right">{tx.contacts?.name || '-'}</TableCell>
                        <TableCell className="text-left text-muted-foreground font-mono text-[15px] font-semibold px-6">
                          {Number(tx.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-left font-black text-foreground font-mono text-[15px] px-6">
                          {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground text-sm font-mono font-medium px-6">
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-left px-6">
                          <div className="flex justify-start opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-card shadow-sm border-border text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-4">
              {filteredTransactions.map((tx) => {
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <div 
                    key={tx.id} 
                    onClick={() => router.push(`/transactions/${tx.id}`)} 
                    className={`bg-card border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
                      isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(prev => [...prev, tx.id]);
                              else setSelectedIds(prev => prev.filter(id => id !== tx.id));
                            }}
                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer mt-1 relative z-10"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground">{tx.reference_number}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tx.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                              {t.types[tx.type as 'SALE' | 'PURCHASE'][language]}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-muted-foreground mt-0.5">{tx.contacts?.name || '-'}</div>
                        </div>
                      </div>
                      <div className="text-left font-mono font-black text-foreground bg-secondary/30 px-2.5 py-1 rounded-lg">
                        {Number(tx.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3 mt-1 font-mono">
                      <div>{new Date(tx.transaction_date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1">
                        <span>الفرعي:</span>
                        <span className="font-semibold text-foreground">{Number(tx.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
