'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CreateProductSchema, CreateProductInput } from './schemas';
import { getUser } from '../auth/actions';

export async function createProduct(input: CreateProductInput) {
  const user = await getUser();
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
    if (error.code === '23505') { // Unique violation
      return { success: false, code: "CONFLICT", message: "SKU already exists" };
    }
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function getProducts() {
  const user = await getUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('products_or_services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}
