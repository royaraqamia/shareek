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
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {t('title')}
          {isOfflineMode && <WifiOff className="w-5 h-5 text-amber-500 animate-pulse ml-2" />}
        </h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="w-4 h-4 text-white" />
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

      <div className="rounded-md border bg-card flex-1 overflow-hidden">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <PackageOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium">{t('emptyTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('emptyDesc')}</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{tCol('name')}</TableHead>
                <TableHead className="text-right">{tCol('sku')}</TableHead>
                <TableHead className="text-left">{tCol('stock')}</TableHead>
                <TableHead className="text-left">{tCol('price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-right">{product.name}</TableCell>
                  <TableCell className="text-right">{product.sku || '-'}</TableCell>
                  <TableCell className="text-left">
                    {product.is_service ? <span className="text-slate-400">خدمة لا تتبع</span> : product.current_stock}
                  </TableCell>
                  <TableCell className="text-left font-mono">
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
