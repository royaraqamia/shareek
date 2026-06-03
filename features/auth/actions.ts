'use server'

import { createClient } from '@/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { SignUpSchema, SignInSchema, SignUpInput, SignInInput } from './schemas';

// Creates an administrative client using the service role key to bypass RLS policies for platform-level profile management
function createAdminClient(cookieStore: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "لم يتم العثور على مفتاح الخدمة الإشرافية الإدارية لـ Supabase (SUPABASE_SERVICE_ROLE_KEY) أو رابط الخدمة. يرجى التأكد من تكوينهم في متغيرات البيئة الخاصة بمشروعك (سواء في إعدادات Vercel أو AI Studio) ثم إعادة بناء ونشر التطبيق.\n\nSupabase URL or SUPABASE_SERVICE_ROLE_KEY not found in environment variables. Please configure them in your Vercel or AI Studio project settings, then redeploy."
    );
  }

  return createServerClient(
    url,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handled in server components safely
          }
        },
      },
    }
  )
}

// Checks if a specific user UUID is registered as a platform administrator in the profiles table
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', userId)
      .maybeSingle();
    return !!(profile as any)?.is_platform_admin;
  } catch {
    return false;
  }
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { success: false as const, code: "UNAUTHORIZED", message: "User not authenticated." };
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name, email, username, is_approved, is_platform_admin')
      .eq('id', data.user.id)
      .single();
      
    if (!profile) {
      return { success: false as const, code: "UNAUTHORIZED", message: "User profile not found." };
    }
    
    return { 
      success: true as const, 
      user: data.user, 
      organizationId: profile.organization_id, 
      role: profile.role,
      fullName: profile.full_name,
      email: profile.email,
      username: profile.username || "",
      is_approved: !!profile.is_approved,
      isPlatformAdmin: !!(profile as any).is_platform_admin
    };
  } catch (err: any) {
    return { success: false as const, code: "UNAUTHORIZED", message: err.message || "Failed to retrieve authenticated profile info." };
  }
}

// Security gate: blocks any database mutation/query action from unapproved or unauthenticated sessions
export async function getApprovedUser() {
  const result = await getUser();
  if (!result.success) {
    return { success: false as const, code: "UNAUTHORIZED", message: "User not authenticated." };
  }
  
  const isPlatform = !!result.isPlatformAdmin;
  if (!result.is_approved && !isPlatform) {
    return { success: false as const, code: "APPROVAL_PENDING", message: "حسابك قيد المراجعة والتدقيق والقبول من قِبَل الإدارة العامة، يُرجى الانتظار." };
  }
  
  return result;
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
    const adminSupabase = createAdminClient(cookieStore);

    // 1. Check if username is already taken
    const { data: existingUser } = await adminSupabase
      .from('profiles')
      .select('username')
      .eq('username', validation.data.username)
      .maybeSingle();

    if (existingUser) {
      return { success: false, code: "CONFLICT", message: "اسم المستخدم هذا مستخدم بالفعل من قِبَل شخص آخر، يُرجى اختيار اسم مستخدم مختلف." };
    }

    // Check if email is already taken
    const { data: existingEmailUser } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('email', validation.data.email.toLowerCase())
      .maybeSingle();

    if (existingEmailUser) {
      return { success: false, code: "CONFLICT", message: "البريد الإلكتروني هذا مستخدم بالفعل من قِبَل شخص آخر، يُرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول." };
    }

    // Clean up orphaned user from auth.users if they exist there but not in public.profiles.
    // This heals states caused by manual public database wipes/truncation without clearing Auth.
    try {
      const { data: listUsersData, error: listUsersError } = await adminSupabase.auth.admin.listUsers();
      if (!listUsersError && listUsersData?.users) {
        const existingAuthUser = listUsersData.users.find(
          (u) => u.email?.toLowerCase() === validation.data.email.toLowerCase()
        );
        if (existingAuthUser) {
          await adminSupabase.auth.admin.deleteUser(existingAuthUser.id);
        }
      }
    } catch (cleanupErr) {
      console.error("Orphaned user cleanup error:", cleanupErr);
    }

    // 2. Log in / Sign up via supabase.auth
    const headerList = await headers();
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : 'https://shareek.royaraqamia.com';
    const redirectTo = `${origin}/dashboard`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (authError) {
      return { success: false, code: "AUTH_ERROR", message: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, code: "AUTH_ERROR", message: "Authentication provider failed to assign a user ID." };
    }

    // 3. Create organization in database
    const { data: orgData, error: orgError } = await adminSupabase
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

    // 4. Create profile linked to organization
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert([{
        id: userId,
        organization_id: orgData.id,
        email: validation.data.email,
        role: 'ADMIN',
        full_name: validation.data.fullName,
        username: validation.data.username,
        is_approved: false, // Default to false, can be approved by a platform administrator
      }]);

    if (profileError) {
      return { success: false, code: "DATABASE_ERROR", message: profileError.message };
    }

    return { 
      success: true, 
      user: authData.user, 
      organizationId: orgData.id,
      is_approved: false 
    };
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

    let email = validation.data.email.trim();

    // If identifier doesn't look like an email (no '@'), treat as username
    if (!email.includes('@')) {
      const adminSupabase = createAdminClient(cookieStore);
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('email')
        .eq('username', email.toLowerCase())
        .maybeSingle();

      if (profileError || !profile || !profile.email) {
        return { success: false, code: "USER_NOT_FOUND", message: "اسم المستخدم المكتوب غير موجود بالنظام." };
      }
      email = profile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: validation.data.password,
    });

    if (error) {
      return { success: false, code: "AUTH_ERROR", message: "فشل دخول: اسم المستخدم أو كلمة المرور غير مطابقة." };
    }

    const platformAdmin = await isPlatformAdmin(data.user.id);
    return { success: true, user: data.user, isPlatformAdmin: platformAdmin };
  } catch (err: any) {
    return { success: false, code: "SYSTEM_EXCEPTION", message: err.message || "An exception occurred during login." };
  }
}

// Checks if a username meets constraints & isn't already taken
export async function checkUsernameAction(username: string) {
  if (!username) {
    return { success: false, code: "EMPTY", message: "اسم المستخدم مطلوب." };
  }
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return { success: false, code: "SHORT", message: "يجب أن يكون 3 أحرف على الأقل" };
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(cleanUsername)) {
    return { success: false, code: "INVALID_SPELLING", message: "أحرف إنجليزية صغيرة، أرقام، أو شرطة سفلية فقط" };
  }

  try {
    const cookieStore = await cookies();
    const adminSupabase = createAdminClient(cookieStore);
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error) {
      return { success: false, code: "DB_ERROR", message: "فشل التحقق." };
    }
    if (data) {
      return { success: false, code: "TAKEN", message: "اسم المستخدم مستخدم بالفعل" };
    }
    return { success: true, code: "AVAILABLE", message: "اسم المستخدم متاح!" };
  } catch {
    return { success: false, code: "EXCEPTION", message: "خطأ بالاتصال بقاعدة البيانات" };
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

// Fetch all registered profiles across organizations (Platform Admin ONLY)
export async function getAdminUsers() {
  const user = await getUser();
  if (!user.success) return { success: false, message: "غير مصرح لك بالوصول" };
  
  const isPlatform = !!user.isPlatformAdmin;
  if (!isPlatform) {
    return { success: false, message: "هذه الصلاحية مخصصة لإدارة النظام العامة فقط." };
  }
  
  try {
    const cookieStore = await cookies();
    const supabase = createAdminClient(cookieStore);
    
    // We get all profiles together with their organizations
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, username, is_approved, created_at, organizations(name)')
      .order('created_at', { ascending: false });
      
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Toggle an account's approval flag (Platform Admin ONLY)
export async function toggleUserApprovalAction(targetUserId: string, approved: boolean) {
  const user = await getUser();
  if (!user.success) return { success: false, message: "غير مصرح لك بالوصول" };
  
  const isPlatform = !!user.isPlatformAdmin;
  if (!isPlatform) {
    return { success: false, message: "هذه الصلاحية مخصصة لإدارة النظام العامة فقط." };
  }
  
  try {
    const cookieStore = await cookies();
    const supabase = createAdminClient(cookieStore);
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: approved })
      .eq('id', targetUserId);
      
    if (error) return { success: false, message: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
