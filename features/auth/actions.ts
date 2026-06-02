'use server'

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { SignUpSchema, SignInSchema, SignUpInput, SignInInput } from './schemas';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { success: false, code: "UNAUTHORIZED", message: "User not authenticated." };
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name, email')
      .eq('id', data.user.id)
      .single();
      
    if (!profile) {
      return { success: false, code: "UNAUTHORIZED", message: "User profile not found." };
    }
    
    return { 
      success: true, 
      user: data.user, 
      organizationId: profile.organization_id, 
      role: profile.role,
      fullName: profile.full_name,
      email: profile.email
    };
  } catch (err: any) {
    return { success: false, code: "UNAUTHORIZED", message: err.message || "Failed to retrieve authenticated profile info." };
  }
}

export async function signUpAction(input: SignUpInput) {
  const validation = SignUpSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      errors: validation.error.issues,
    };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Log in / Sign up via supabase.auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (authError) {
      return { success: false, code: "AUTH_ERROR", message: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, code: "AUTH_ERROR", message: "Authentication provider failed to assign a user ID." };
    }

    // 2. Create organization in database
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([{
        name: validation.data.organizationName,
        currency: 'SAR',
      }])
      .select()
      .single();

    if (orgError) {
      return { success: false, code: "DATABASE_ERROR", message: orgError.message };
    }

    // 3. Create profile linked to organization
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        organization_id: orgData.id,
        email: validation.data.email,
        role: 'ADMIN',
        full_name: validation.data.fullName,
      }]);

    if (profileError) {
      return { success: false, code: "DATABASE_ERROR", message: profileError.message };
    }

    return { success: true, user: authData.user, organizationId: orgData.id };
  } catch (err: any) {
    return { success: false, code: "SYSTEM_EXCEPTION", message: err.message || "An exception occurred during signup." };
  }
}

export async function signInAction(input: SignInInput) {
  const validation = SignInSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      errors: validation.error.issues,
    };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      return { success: false, code: "AUTH_ERROR", message: error.message };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, code: "SYSTEM_EXCEPTION", message: err.message || "An exception occurred during login." };
  }
}

export async function signOutAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || "An error occurred during sign out" };
  }
}
