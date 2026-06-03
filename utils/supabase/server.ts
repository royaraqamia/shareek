import { createServerClient } from '@supabase/ssr'

export function createClient(cookieStore: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "لم يتم العثور على إعدادات الاتصال بـ Supabase. يرجى التأكد من إضافة 'NEXT_PUBLIC_SUPABASE_URL' و 'NEXT_PUBLIC_SUPABASE_ANON_KEY' في متغيرات البيئة الخاصة بمشروعك (سواء في إعدادات Vercel أو AI Studio) ثم إعادة بناء ونشر التطبيق (Redeploy).\n\nSupabase configuration not found. Please make sure 'NEXT_PUBLIC_SUPABASE_URL' and 'NEXT_PUBLIC_SUPABASE_ANON_KEY' are specified in your Vercel or AI Studio environment variables, then redeploy your application."
    );
  }

  return createServerClient(
    url,
    anonKey,
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
