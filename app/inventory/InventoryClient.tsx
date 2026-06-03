'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Language } from '@/store/useAppStore';
import { useOfflineDataStore } from '@/store/useOfflineDataStore';
import { PackageOpen, Plus, Loader2, WifiOff } from 'lucide-react';
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
import { createProduct } from '@/features/inventory/actions';
import { toast } from '@/utils/toast';
import { useRouter } from 'next/navigation';

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const { inventory: offlineProducts, setInventory: setOfflineProducts, enqueueMutation } = useOfflineDataStore();
  const [products, setProducts] = useState(initialProducts);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const language = useAppStore(state => state.language) as Language;
  const router = useRouter();

  // Sync server data to offline store on mount if online
  useEffect(() => {
    if (navigator.onLine) {
      setIsOfflineMode(false);
      setOfflineProducts(initialProducts);
      setProducts(initialProducts);
    } else {
      setIsOfflineMode(true);
      setProducts(offlineProducts);
    }
  }, [initialProducts, navigator.onLine, setOfflineProducts]);

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

      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl flex-1 overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 lg:p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-400">
              <PackageOpen className="w-10 h-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-800">{t('emptyTitle')}</h3>
              <p className="text-base text-slate-500 font-medium max-w-sm">{t('emptyDesc')}</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-200">
                <TableHead className="text-right font-bold text-slate-600 h-12 px-6">{tCol('name')}</TableHead>
                <TableHead className="text-right font-bold text-slate-600 px-6">{tCol('sku')}</TableHead>
                <TableHead className="text-left font-bold text-slate-600 px-6">{tCol('stock')}</TableHead>
                <TableHead className="text-left font-bold text-slate-600 px-6">{tCol('price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group h-16">
                  <TableCell className="font-bold text-slate-900 text-right px-6 text-[15px]">{product.name}</TableCell>
                  <TableCell className="text-right font-mono text-[15px] text-slate-600 font-medium px-6">{product.sku || '-'}</TableCell>
                  <TableCell className="text-left px-6">
                    {product.is_service ? <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold border border-slate-200/60 bg-slate-50 text-slate-500">خدمة لا تتبع</span> : <span className="font-mono font-bold text-emerald-600 text-[15px]">{product.current_stock}</span>}
                  </TableCell>
                  <TableCell className="text-left font-mono font-black text-slate-900 text-[15px] px-6">
                    {Number(product.sale_price).toFixed(2)} SAR
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
