import { getProducts } from '@/features/inventory/actions';
import { InventoryClient } from './InventoryClient';

export default async function InventoryPage() {
  const result = await getProducts();
  
  // Safe default if auth/database fails gracefully during dev
  const products = result.success ? (result as any).data : [];

  return (
    <div className="container max-w-screen-2xl mx-auto px-4 md:px-8 py-8 h-[calc(100vh-3.5rem)]">
      <InventoryClient initialProducts={products} />
    </div>
  );
}
