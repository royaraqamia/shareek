'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [products] = useState(initialProducts);
  const language = useAppStore(state => state.language);
  
  const translations = {
    title: { ar: 'المخزون', en: 'Inventory' },
    add: { ar: 'إضافة منتج', en: 'Add Product' },
    emptyTitle: { ar: 'لا توجد منتجات', en: 'No products found' },
    emptyDesc: { ar: 'قم بإضافة منتج جديد للبدء', en: 'Add a new product to get started' },
    columns: {
      name: { ar: 'الاسم', en: 'Name' },
      sku: { ar: 'رمز المنتج', en: 'SKU' },
      stock: { ar: 'المخزون', en: 'Stock' },
      price: { ar: 'سعر البيع', en: 'Sale Price' },
    }
  };

  const t = (key: keyof typeof translations) => translations[key][language];
  const tCol = (key: keyof typeof translations.columns) => translations.columns[key][language];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('add')}
        </Button>
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
                <TableHead>{tCol('name')}</TableHead>
                <TableHead>{tCol('sku')}</TableHead>
                <TableHead className="text-end">{tCol('stock')}</TableHead>
                <TableHead className="text-end">{tCol('price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell className="text-end">{product.current_stock}</TableCell>
                  <TableCell className="text-end">{product.sale_price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
