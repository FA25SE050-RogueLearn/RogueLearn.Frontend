// src/app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error_param = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  // Handle OAuth error responses
  if (error_param) {
    console.error('OAuth error:', error_param, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error_param)}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Session exchange error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      // Get the session after successful exchange
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session after code exchange');
        return NextResponse.redirect(`${origin}/login?error=Session could not be established`);
      }

      const response = NextResponse.redirect(`${origin}${next}`);
      const isHttps = new URL(request.url).protocol === 'https:';
      const domain = process.env['NEXT_PUBLIC_COOKIE_DOMAIN'];

      // Set cookies for custom token handling
      if (session.access_token) {
        const exp = session.expires_at 
          ? Math.max(0, Math.floor(session.expires_at - Math.floor(Date.now() / 1000))) 
          : 3600;
        response.cookies.set('rl_access_token', session.access_token, { 
          path: '/', 
          maxAge: exp, 
          secure: isHttps, 
          sameSite: isHttps ? 'none' : 'lax', 
          domain: domain || undefined 
        });
      }
      
      if (session.refresh_token) {
        response.cookies.set('rl_refresh_token', session.refresh_token, { 
          path: '/', 
          maxAge: 60 * 60 * 24 * 30, 
          secure: isHttps, 
          sameSite: isHttps ? 'none' : 'lax', 
          domain: domain || undefined 
        });
      }

      return response;
    } catch (err) {
      console.error('Auth callback exception:', err);
      return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
    }
  }

  // No code provided
  console.error('Authentication callback: no code provided');
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}