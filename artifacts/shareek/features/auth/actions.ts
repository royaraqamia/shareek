'use server'

import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { SignUpSchema, SignInSchema, SignUpInput, SignInInput } from './schemas';

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "لم يتم العثور على مفتاح الخدمة الإشرافية الإدارية لـ Supabase (SUPABASE_SERVICE_ROLE_KEY) أو رابط الخدمة."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
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

    // Use the regular (session-scoped) client so RLS enforces the user can only
    // read their own profile row (auth.uid() = id). Admin client is reserved for
    // operations that must bypass RLS (admin panel, signup bootstrap, etc.).
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name, email, username, is_approved, is_platform_admin')
      .eq('id', data.user.id)
      .maybeSingle();

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
      isPlatformAdmin: !!(profile as any).is_platform_admin,
      isEmailConfirmed: !!data.user?.email_confirmed_at
    };
  } catch (err: any) {
    return { success: false as const, code: "UNAUTHORIZED", message: err.message || "Failed to retrieve authenticated profile info." };
  }
}

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
    const adminSupabase = createAdminClient();

    // Check if username is already taken
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

    // Build redirect URL from request headers
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

    // Create organization
    const orgName = validation.data.organizationName || `مؤسسة ${validation.data.fullName}`;
    const { data: orgData, error: orgError } = await adminSupabase
      .from('organizations')
      .insert([{
        name: orgName,
        currency: 'SAR',
      }])
      .select()
      .single();

    if (orgError) {
      // Clean up the auth user so the email is free to retry
      await adminSupabase.auth.admin.deleteUser(userId).catch(() => {});
      return { success: false, code: "DATABASE_ERROR", message: orgError.message };
    }

    // Create profile linked to organization
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert([{
        id: userId,
        organization_id: orgData.id,
        email: validation.data.email,
        role: 'ADMIN',
        full_name: validation.data.fullName,
        username: validation.data.username,
        is_approved: false,
      }]);

    if (profileError) {
      // Clean up both org and auth user so the state is consistent
      await adminSupabase.from('organizations').delete().eq('id', orgData.id).catch(() => {});
      await adminSupabase.auth.admin.deleteUser(userId).catch(() => {});
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

    if (!email.includes('@')) {
      const adminSupabase = createAdminClient();
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
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('profiles')
      .select('username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (error) {
      return { success: false, code: "DB_ERROR", message: `فشل التحقق: ${error.message}` };
    }
    if (data) {
      return { success: false, code: "TAKEN", message: "اسم المستخدم مستخدم بالفعل" };
    }
    return { success: true, code: "AVAILABLE", message: "اسم المستخدم متاح!" };
  } catch (err: any) {
    return { success: false, code: "EXCEPTION", message: `خطأ بالاتصال بقاعدة البيانات: ${err.message || err}` };
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

export async function getAdminUsers() {
  const user = await getUser();
  if (!user.success) return { success: false, message: "غير مصرح لك بالوصول" };

  if (!user.isPlatformAdmin) {
    return { success: false, message: "هذه الصلاحية مخصصة لإدارة النظام العامة فقط." };
  }

  try {
    const supabase = createAdminClient();
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

export async function toggleUserApprovalAction(targetUserId: string, approved: boolean) {
  const user = await getUser();
  if (!user.success) return { success: false, message: "غير مصرح لك بالوصول" };

  if (!user.isPlatformAdmin) {
    return { success: false, message: "هذه الصلاحية مخصصة لإدارة النظام العامة فقط." };
  }

  try {
    const supabase = createAdminClient();
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

export async function requestPasswordResetAction(email: string) {
  if (!email) {
    return { success: false, message: "يُرجَى إدخال البريد الإلكتروني." };
  }

  const emailTrimmed = email.trim().toLowerCase();

  if (!emailTrimmed.includes('@') || emailTrimmed.length < 5) {
    return { success: false, message: "يُرجَى إدخال بريد إلكتروني صحيح." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const headerList = await headers();
    const host = headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : 'https://shareek.royaraqamia.com';
    const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
      redirectTo,
    });

    if (error) {
      return { success: false, message: `فشل إرسال بريد إعادة التعيين: ${error.message}` };
    }

    const parts = emailTrimmed.split('@');
    const maskedEmail = parts[0].length > 3
      ? `${parts[0].slice(0, 3)}***@${parts[1]}`
      : `***@${parts[1]}`;

    return {
      success: true,
      message: `تمَّ إرسال رابط تغيير كلمة المرور إلى البريد الإلكتروني: ${maskedEmail}`,
      email: maskedEmail
    };
  } catch (err: any) {
    return { success: false, message: err.message || "حدث خطأ غير متوقع أثناء معالجة الطلب." };
  }
}

export async function updatePasswordAction(password: string) {
  if (!password || password.length < 8) {
    return { success: false, message: "يجب أن تكون كلمة المرور 8 أحرف على الأقل." };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return { success: false, message: `فشل تحديث كلمة المرور: ${error.message}` };
    }

    await supabase.auth.signOut();

    return { success: true, message: "تمَّ تحديث كلمة المرور بنجاح! يُرجى الدخول بكلمة المرور الجديدة." };
  } catch (err: any) {
    return { success: false, message: err.message || "حدث خطأ غير متوقع أثناء تحديث كلمة المرور." };
  }
}
