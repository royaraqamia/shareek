'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { success: false, code: "UNAUTHORIZED", message: "User not authenticated." };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', data.user.id)
    .single();
    
  if (!profile) {
    return { success: false, code: "UNAUTHORIZED", message: "User profile not found." };
  }
  
  return { 
    success: true, 
    user: data.user, 
    organizationId: profile.organization_id, 
    role: profile.role 
  };
}
