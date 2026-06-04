'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CreateTransactionSchema, CreateTransactionInput } from './schemas';
import { getApprovedUser } from '../auth/actions';

export async function createTransaction(input: CreateTransactionInput) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const validation = CreateTransactionSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Invalid transaction data",
      errors: validation.error.issues,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: transactionId, error } = await supabase.rpc('create_transaction_with_items', {
    p_organization_id: user.organizationId,
    p_contact_id: validation.data.contactId,
    p_type: validation.data.type,
    p_reference_number: validation.data.referenceNumber,
    p_tax_rate: validation.data.taxRate,
    p_idempotency_key: validation.data.idempotencyKey,
    p_payment_status: validation.data.paymentStatus,
    p_items: validation.data.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      version: item.version,
    })),
  });

  if (error) {
    if (error.message.includes('INSUFFICIENT_STOCK')) {
      return { success: false, code: "INSUFFICIENT_STOCK", message: "Transaction aborted due to insufficient inventory limits on selected items." };
    }
    if (error.message.includes('CONCURRENT_UPDATE_CONFLICT')) {
      return { success: false, code: "CONCURRENT_UPDATE_CONFLICT", message: "Transaction aborted due to concurrent update conflict." };
    }
    if (error.code === '23505') {
      return { success: false, code: "CONFLICT", message: "A transaction with this reference number already exists." };
    }
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  const { data } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .eq('id', transactionId)
    .single();

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/inventory');
  return { success: true, data };
}

export async function getTransactions() {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, contacts(name)')
    .order('transaction_date', { ascending: false })
    .limit(500);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function getTransactionById(id: string) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, contacts(*), transaction_items(*, product:products_or_services(*))')
    .eq('id', id)
    .single();

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function bulkDeleteTransactionsAction(ids: string[]) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  if (!ids.length) return { success: true };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch transactions with items BEFORE deleting so we can reverse stock
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, type, transaction_items(product_id, quantity)')
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (fetchError) {
    return { success: false, code: "DATABASE_ERROR", message: fetchError.message };
  }

  // Build net stock delta per product:
  // SALE was created => stock was decremented => on delete, add back
  // PURCHASE was created => stock was incremented => on delete, subtract back
  const stockDeltas: Record<string, number> = {};
  for (const tx of transactions ?? []) {
    for (const item of (tx.transaction_items as any[]) ?? []) {
      const delta = tx.type === 'SALE' ? item.quantity : -item.quantity;
      stockDeltas[item.product_id] = (stockDeltas[item.product_id] ?? 0) + delta;
    }
  }

  // Reverse stock for affected products (non-services only)
  const productIds = Object.keys(stockDeltas);
  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products_or_services')
      .select('id, current_stock, is_service')
      .in('id', productIds)
      .eq('organization_id', user.organizationId);

    if (products) {
      await Promise.all(
        products
          .filter(p => !p.is_service)
          .map(product => {
            const newStock = Math.max(0, (product.current_stock ?? 0) + (stockDeltas[product.id] ?? 0));
            return supabase
              .from('products_or_services')
              .update({ current_stock: newStock })
              .eq('id', product.id)
              .eq('organization_id', user.organizationId);
          })
      );
    }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/transactions');
  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function bulkUpdateTransactionsPaymentAction(ids: string[], paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID') {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('transactions')
    .update({ payment_status: paymentStatus })
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/transactions');
  return { success: true };
}
