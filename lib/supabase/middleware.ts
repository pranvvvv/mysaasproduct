import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Middleware Supabase client — refreshes auth tokens on every request.
// This ensures sessions stay alive and prevents stale tokens.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isDashboardPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      loginUrl.searchParams.set('error', 'Authentication is temporarily unavailable.');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    });

    // Refresh the session — this is what keeps auth alive.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect dashboard routes — redirect to login if not authenticated.
    if (!user && isDashboardPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Never crash middleware in production; fail closed for protected routes.
    if (isDashboardPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      loginUrl.searchParams.set('error', 'Session refresh failed. Please sign in again.');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }
}
