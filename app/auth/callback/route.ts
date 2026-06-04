import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in parameters, redirect there after login, otherwise default to reset-password
  const next = searchParams.get('next') ?? '/auth/reset-password';

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("Auth callback exchange error:", error.message);
    } catch (err: any) {
      console.error("Auth callback exception:", err.message || err);
    }
  }

  // If anything fails, return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate password reset request`);
}
