'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { PackageOpen, Plus, Loader2, WifiOff, Search, Trash2, Edit, SlidersHorizontal, Check } from 'lucide-react';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct, bulkDeleteProductsAction, bulkUpdateProductsAction } from '@/features/inventory/actions';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const { inventory: offlineProducts, setInventory: setOfflineProducts, enqueueMutation } = useOfflineDataStore();
  const [products, setProducts] = useState(initialProducts);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStockOpen, setBulkStockOpen] = useState(false);
  const [bulkStockVal, setBulkStockVal] = useState('');
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceVal, setBulkPriceVal] = useState('');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Sync server data to offline store on mount if online
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      if (isMounted) setIsOfflineMode(false);
      setOfflineProducts(initialProducts);
      if (isMounted) setProducts(initialProducts);
    } else {
      if (isMounted) setIsOfflineMode(true);
      const currentOfflineProducts = useOfflineDataStore.getState().inventory;
      if (isMounted) setProducts(currentOfflineProducts);
    }
    return () => { isMounted = false; };
  }, [initialProducts, setOfflineProducts]);

  // Open "Add Product" Dialog automatically if ?new=true query param is present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('new=true')) {
      setIsOpen(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Create Product Form States
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentStock, setCurrentStock] = useState('0');
  const [isService, setIsService] = useState(false);
  
  const translations = {
    title: { ar: 'المخزون', en: 'Inventory' },
    add: { ar: 'إضافة منتج', en: 'Add Product' },
    emptyTitle: { ar: 'لا توجد منتجات', en: 'No products found' },
    emptyDesc: { ar: 'قم بإضافة منتج جديد للبدء', en: 'Add a new product to get started' },
  };

  const columnTranslations = {
    name: { ar: 'الاسم', en: 'Name' },
    sku: { ar: 'رمز المنتج', en: 'SKU' },
    stock: { ar: 'المخزون', en: 'Stock' },
    price: { ar: 'سعر البيع', en: 'Sale Price' },
  };

  const t = (key: keyof typeof translations) => translations[key][language];
  const tCol = (key: keyof typeof columnTranslations) => columnTranslations[key][language];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'PRODUCT') return matchesSearch && !product.is_service;
    if (filterType === 'SERVICE') return matchesSearch && product.is_service;
    return matchesSearch;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('يرجى إدخال اسم البند');
      return;
    }
    if (!salePrice || Number(salePrice) < 0) {
      toast.error('يرجى إدخال سعر بيع صحيح');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name,
        sku: sku || undefined,
        salePrice: Number(salePrice),
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        currentStock: isService ? 0 : Number(currentStock),
        isService,
      };

      if (!navigator.onLine) {
        // Offline Flow
        enqueueMutation({
          type: 'CREATE_INVENTORY',
          data: productData
        });
        
        const tempProduct = {
          id: crypto.randomUUID(),
          ...productData,
          created_at: new Date().toISOString()
        };
        
        const newProducts = [tempProduct, ...products];
        setOfflineProducts(newProducts);
        setProducts(newProducts);
        
        toast.success("تم تسجيل المنتج محلياً (وضع عدم الاتصال)");
        setIsOpen(false);
        setName(''); setSku(''); setSalePrice(''); setPurchasePrice(''); setCurrentStock('0'); setIsService(false);
        return;
      }

      // Online Flow
      const response = await createProduct(productData) as any;

      if (response.success && response.data) {
        toast.success('تمت إضافة المنتج بنجاح!');
        const newProducts = [response.data, ...products];
        setProducts(newProducts);
        setOfflineProducts(newProducts);
        setIsOpen(false);
        // Clear fields
        setName('');
        setSku('');
        setSalePrice('');
        setPurchasePrice('');
        setCurrentStock('0');
        setIsService(false);
        router.refresh();
      } else {
        toast.error(response.message || 'حدث خطأ أثناء رصد البند الجديد');
      }
    } catch (err: any) {
      toast.error('فشلت العملية، يرجى التحقق من المدخلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const res = await bulkDeleteProductsAction(selectedIds);
      if (res.success) {
        toast.success(language === 'ar' ? 'تم الحذف بنجاح!' : 'Deleted successfully!');
        const updated = products.filter(p => !selectedIds.includes(p.id));
        setProducts(updated);
        setOfflineProducts(updated);
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

  const handleBulkUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const stock = Number(bulkStockVal);
    if (isNaN(stock) || stock < 0) {
      toast.error(language === 'ar' ? 'يرجى إدخال قيمة مخزون صحيحة' : 'Invalid stock value');
      return;
    }

    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateProductsAction(selectedIds, { currentStock: stock });
      if (res.success) {
        toast.success(language === 'ar' ? 'تم التحديث بنجاح!' : 'Updated successfully!');
        const updated = products.map(p => selectedIds.includes(p.id) ? { ...p, current_stock: stock } : p);
        setProducts(updated);
        setOfflineProducts(updated);
        setSelectedIds([]);
        setBulkStockOpen(false);
        setBulkStockVal('');
      } else {
        toast.error(res.message || 'فشل التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(bulkPriceVal);
    if (isNaN(price) || price < 0) {
      toast.error(language === 'ar' ? 'يرجى إدخال سعر بيع صحيح' : 'Invalid price value');
      return;
    }

    setIsBulkUpdating(true);
    try {
      const res = await bulkUpdateProductsAction(selectedIds, { salePrice: price });
      if (res.success) {
        toast.success(language === 'ar' ? 'تم التحديث بنجاح!' : 'Updated successfully!');
        const updated = products.map(p => selectedIds.includes(p.id) ? { ...p, sale_price: price } : p);
        setProducts(updated);
        setOfflineProducts(updated);
        setSelectedIds([]);
        setBulkPriceOpen(false);
        setBulkPriceVal('');
      } else {
        toast.error(res.message || 'فشل التحديث');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (

    <div className="flex flex-col h-full space-y-8 container max-w-[90rem] mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
              <PackageOpen className="w-7 h-7" />
            </div>
            {t('title')}
            {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
          </h1>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 cursor-pointer bg-primary shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 text-white font-bold rounded-xl transition-all h-12 px-6 w-full sm:w-auto">
              <Plus className="w-5 h-5 text-white" />
              {t('add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة منتج أو خدمة جديدة</DialogTitle>
              <DialogDescription className="text-right">
                أدخل تفاصيل البند الجديد لحفظه في الكتالوج والمستودع.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prod-name" className="text-right block">اسم البند <span className="text-red-500">*</span></Label>
                <Input
                  id="prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ترخيص برمجيات، حاسوب لوحي..."
                  required
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-sku" className="text-right block">رمز المنتج (SKU)</Label>
                  <Input
                    id="prod-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-2026"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right block">نوع البند</Label>
                  <div className="flex gap-4 h-10 items-center justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <span>خدمة</span>
                      <input
                        type="checkbox"
                        checked={isService}
                        onChange={(e) => setIsService(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-sale-price" className="text-right block">سعر البيع (SAR) <span className="text-red-500">*</span></Label>
                  <Input
                    id="prod-sale-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-purchase-price" className="text-right block">سعر الشراء (اختياري)</Label>
                  <Input
                    id="prod-purchase-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              {!isService && (
                <div className="space-y-2 animate-fadeIn">
                  <Label htmlFor="prod-stock" className="text-right block">الكمية المتوفرة حالياً بالمنشأة</Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="text-right"
                  />
                </div>
              )}

              <DialogFooter className="flex sm:justify-start pt-4 gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer px-6">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      جاري الحفظ...
                    </>
                  ) : 'حفظ وإضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer">
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Elegant Search & Filter Controls Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm relative z-10 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث باسم البند أو رمز فريد SKU...' : 'Search by description or SKU...'}
            className="pr-10 pl-4 h-11 text-right bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-end">
          <Button
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الكل' : 'All'} ({products.length})
          </Button>
          <Button
            variant={filterType === 'PRODUCT' ? 'default' : 'outline'}
            onClick={() => setFilterType('PRODUCT')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'المنتجات' : 'Products'} ({products.filter(p => !p.is_service).length})
          </Button>
          <Button
            variant={filterType === 'SERVICE' ? 'default' : 'outline'}
            onClick={() => setFilterType('SERVICE')}
            className="rounded-xl h-10 px-4 font-bold text-xs"
          >
            {language === 'ar' ? 'الخدمات' : 'Services'} ({products.filter(p => p.is_service).length})
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
            {/* Update Stock Dialog */}
            <Dialog open={bulkStockOpen} onOpenChange={setBulkStockOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-9 rounded-lg border-amber-500/30 font-bold text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'تحديث المخزون' : 'Update Stock'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-right">تحديث مخزون العناصر المحددة</DialogTitle>
                  <DialogDescription className="text-right">
                    سيتم تطبيق هذه القيمة على {selectedIds.length} عنصر محدد.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBulkUpdateStock} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-stock" className="text-right block">الكمية الجديدة للمخزون</Label>
                    <Input
                      id="bulk-stock"
                      type="number"
                      min="0"
                      value={bulkStockVal}
                      onChange={(e) => setBulkStockVal(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <DialogFooter className="flex sm:justify-start gap-2">
                    <Button type="submit" disabled={isBulkUpdating} className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                      {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث الكل'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setBulkStockOpen(false)}>إلغاء</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Update Price Dialog */}
            <Dialog open={bulkPriceOpen} onOpenChange={setBulkPriceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 h-9 rounded-lg border-amber-500/30 font-bold text-xs">
                  <Edit className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'تحديث سعر البيع' : 'Update Price'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-right">تحديث سعر البيع للعناصر المحددة</DialogTitle>
                  <DialogDescription className="text-right">
                    سيتم تطبيق هذه القيمة على {selectedIds.length} عنصر محدد.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBulkUpdatePrice} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-price" className="text-right block">سعر البيع الجديد (SAR)</Label>
                    <Input
                      id="bulk-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkPriceVal}
                      onChange={(e) => setBulkPriceVal(e.target.value)}
                      required
                      className="text-right"
                    />
                  </div>
                  <DialogFooter className="flex sm:justify-start gap-2">
                    <Button type="submit" disabled={isBulkUpdating} className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                      {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث الكل'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setBulkPriceOpen(false)}>إلغاء</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl flex-1 overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <EmptyState 
            icon={PackageOpen}
            title={t('emptyTitle')}
            description={t('emptyDesc')}
            buttonText={t('add')}
            buttonIcon={Plus}
            onAction={() => setIsOpen(true)}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState 
            icon={Search}
            title={language === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}
            description={language === 'ar' ? 'جرب البحث بكلمات أخرى أو إعادة تهيئة عوامل التصفية.' : 'Try searching with other keywords or reset your filters.'}
            buttonText={language === 'ar' ? 'إعادة ضبط عوامل التصفية' : 'Reset Filters'}
            onAction={() => { setSearchQuery(''); setFilterType('ALL'); }}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="border-b border-border">
                    <TableHead className="w-[50px] px-4 text-center font-bold text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredProducts.map(p => p.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-input"
                      />
                    </TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground h-12 px-6">{tCol('name')}</TableHead>
                    <TableHead className="text-right font-bold text-muted-foreground px-6">{tCol('sku')}</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground px-6">{tCol('stock')}</TableHead>
                    <TableHead className="text-left font-bold text-muted-foreground px-6">{tCol('price')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors group h-16">
                      <TableCell className="w-[50px] px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, product.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== product.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-input"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-right px-6 text-[15px]">{product.name}</TableCell>
                      <TableCell className="text-right font-mono text-[15px] text-muted-foreground font-medium px-6">{product.sku || '-'}</TableCell>
                      <TableCell className="text-left px-6">
                        {product.is_service ? <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border border-border bg-secondary text-muted-foreground">خدمة لا تتبع</span> : <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[15px]">{product.current_stock}</span>}
                      </TableCell>
                      <TableCell className="text-left font-mono font-black text-foreground text-[15px] px-6">
                        {Number(product.sale_price).toFixed(2)} SAR
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="block md:hidden space-y-3 p-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, product.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== product.id));
                        }}
                        className="w-4 h-4 rounded border-input mt-1"
                      />
                      <div>
                        <div className="font-bold text-foreground text-[15px]">{product.name}</div>
                        <div className="text-sm text-muted-foreground font-mono mt-0.5">{product.sku || '-'}</div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-black text-foreground bg-secondary/30 px-2.5 py-1 rounded-lg">
                      {Number(product.sale_price).toFixed(2)} SAR
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-border pt-3 mt-1">
                    <span className="text-xs font-semibold text-muted-foreground">المخزون:</span>
                    {product.is_service ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-border bg-secondary text-muted-foreground">خدمة لا تتبع</span>
                    ) : (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[13px]">{product.current_stock}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

