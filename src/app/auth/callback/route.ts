// src/app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'; // Redirect to dashboard by default

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { session } } = await supabase.auth.getSession();
      const response = NextResponse.redirect(`${origin}${next}`);
      try {
        const isHttps = new URL(request.url).protocol === 'https:';
        const domain = process.env['NEXT_PUBLIC_COOKIE_DOMAIN'];
        if (session?.access_token) {
          const exp = session.expires_at ? Math.max(0, Math.floor(session.expires_at - Math.floor(Date.now() / 1000))) : 3600;
          response.cookies.set('rl_access_token', session.access_token, { path: '/', maxAge: exp, secure: isHttps, sameSite: isHttps ? 'none' : 'lax', domain });
        }
        if (session?.refresh_token) {
          response.cookies.set('rl_refresh_token', session.refresh_token, { path: '/', maxAge: 60 * 60 * 24 * 30, secure: isHttps, sameSite: isHttps ? 'none' : 'lax', domain });
        }
      } catch {}
      return response;
    }
  }

  // If there's an error or no code, redirect to an error page or the login page
  console.error('Authentication callback error');
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}