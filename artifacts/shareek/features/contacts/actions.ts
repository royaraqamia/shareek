'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CreateContactSchema, CreateContactInput } from './schemas';
import { getApprovedUser } from '../auth/actions';

export async function createContact(input: CreateContactInput) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const validation = CreateContactSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Invalid contact data",
      errors: validation.error.issues,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      organization_id: user.organizationId,
      type: validation.data.type,
      name: validation.data.name,
      phone: validation.data.phone,
      email: validation.data.email || null,
    }])
    .select()
    .single();

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/contacts');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function bulkCreateContacts(contactsList: CreateContactInput[]) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const validatedContacts = [];
  for (const contact of contactsList) {
    const cleanContact = {
      ...contact,
      email: contact.email === "" ? undefined : contact.email
    };
    const validation = CreateContactSchema.safeParse(cleanContact);
    if (!validation.success) {
      return {
        success: false,
        code: "VALIDATION_FAILED",
        message: `بيانات جهة الاتصال "${contact.name || ''}" غير صالحة: ${validation.error.issues.map(i => i.message).join(', ')}`,
      };
    }
    validatedContacts.push({
      organization_id: user.organizationId,
      type: validation.data.type,
      name: validation.data.name,
      phone: validation.data.phone || null,
      email: validation.data.email || null,
    });
  }

  if (validatedContacts.length === 0) {
    return { success: false, message: "لا توجد جهات اتصال صالحة للاستيراد." };
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert(validatedContacts)
    .select();

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/contacts');
  return { success: true, data };
}

export async function getContacts() {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function bulkDeleteContactsAction(ids: string[]) {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('contacts')
    .delete()
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/contacts');
  return { success: true };
}

export async function bulkUpdateContactsTypeAction(ids: string[], type: 'CLIENT' | 'SUPPLIER') {
  const user = await getApprovedUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('contacts')
    .update({ type })
    .in('id', ids)
    .eq('organization_id', user.organizationId);

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  revalidatePath('/contacts');
  return { success: true };
}
