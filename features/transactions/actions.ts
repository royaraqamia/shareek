'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CreateTransactionSchema, CreateTransactionInput } from './schemas';
import { getUser } from '../auth/actions';

export async function createTransaction(input: CreateTransactionInput) {
  const user = await getUser();
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

  // We are calling the custom RPC function created in migrations
  const { data: transactionId, error } = await supabase.rpc('create_transaction_with_items', {
    p_organization_id: user.organizationId,
    p_contact_id: validation.data.contactId,
    p_type: validation.data.type,
    p_reference_number: validation.data.referenceNumber,
    p_tax_rate: validation.data.taxRate,
    p_idempotency_key: validation.data.idempotencyKey,
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

  // Fetch the created transaction to return
  const { data } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .eq('id', transactionId)
    .single();

  return { success: true, data };
}

export async function getTransactions() {
  const user = await getUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, contacts(name)')
    .order('transaction_date', { ascending: false });

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}
