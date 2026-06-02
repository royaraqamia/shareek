'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { UpdateSettingsSchema, UpdateSettingsInput } from './schemas';
import { getUser } from '../auth/actions';

export async function getOrganization() {
  const user = await getUser();
  if (!user.success) return user;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organizationId)
    .single();

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}

export async function updateOrganization(input: UpdateSettingsInput) {
  const user = await getUser();
  if (!user.success) return user;

  const validation = UpdateSettingsSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Invalid configuration data",
      errors: validation.error.issues,
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name: validation.data.name,
      tax_number: validation.data.taxNumber || null,
      currency: validation.data.currency,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.organizationId)
    .select()
    .single();

  if (error) {
    return { success: false, code: "DATABASE_ERROR", message: error.message };
  }

  return { success: true, data };
}
