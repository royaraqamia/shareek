'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CreateProductSchema, CreateProductInput } from './schemas';
import { getApprovedUser } from '../auth/actions';

export async function createProduct(input: CreateProductInput) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const validation = CreateProductSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Invalid product data",
      errors: validation.error.issues,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('products_or_services')
    .insert([{
      organization_id: user.organizationId,
      name: validation.data.name,
      sku: validation.data.sku || null,
      sale_price: validation.data.salePrice,
      purchase_price: validation.data.purchasePrice || null,
      current_stock: validation.data.currentStock,
      is_service: validation.data.isService,
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, code: "CONFLICT", message: "SKU already exists" };
    }
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  return { success: true, data };
}

export async function getProducts() {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('products_or_services')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function bulkDeleteProductsAction(ids: string[]) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('products_or_services')
    .delete()
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function bulkUpdateProductsAction(ids: string[], updates: { currentStock?: number; salePrice?: number; isService?: boolean }) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const dbUpdates: Record<string, unknown> = {};
  if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock;
  if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
  if (updates.isService !== undefined) dbUpdates.is_service = updates.isService;

  const { error } = await supabase
    .from('products_or_services')
    .update(dbUpdates)
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/inventory');
  return { success: true };
}
