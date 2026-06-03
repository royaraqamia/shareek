import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "لم يتم العثور على إعدادات الاتصال بـ Supabase. يرجى التأكد من إضافة 'NEXT_PUBLIC_SUPABASE_URL' و 'NEXT_PUBLIC_SUPABASE_ANON_KEY' في إعدادات البيئة لـ AI Studio.\n\nSupabase configuration not found. Please ensure 'NEXT_PUBLIC_SUPABASE_URL' and 'NEXT_PUBLIC_SUPABASE_ANON_KEY' are configured in AI Studio environments."
    );
  }

  return createBrowserClient(url, anonKey);
}
