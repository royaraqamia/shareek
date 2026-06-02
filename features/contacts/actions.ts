'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CreateContactSchema, CreateContactInput } from './schemas';
import { getUser } from '../auth/actions';

export async function createContact(input: CreateContactInput) {
  const user = await getUser();
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

  return { success: true, data };
}

export async function getContacts() {
  const user = await getUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}
