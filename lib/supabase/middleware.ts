import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabaseConfig } from './config';

// Middleware Supabase client — refreshes auth tokens on every request.
// This ensures sessions stay alive and prevents stale tokens.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getServerSupabaseConfig();
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
  const isOnboardingPath = request.nextUrl.pathname === '/onboarding';
  const isProtectedAuthPath = isDashboardPath || isOnboardingPath;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedAuthPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
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

    // Protect authenticated routes — redirect to login if not authenticated.
    if (!user && isProtectedAuthPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isProtectedAuthPath) {
      const { data: gymId, error: gymIdError } = await supabase.rpc('get_user_gym_id');
      const hasGym = !gymIdError && Boolean(gymId);

      // Users without a linked gym must finish onboarding before entering dashboard.
      if (isDashboardPath && !hasGym) {
        const onboardingUrl = new URL('/onboarding', request.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // Linked users should not stay on onboarding.
      if (isOnboardingPath && hasGym) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    return response;
  } catch {
    // Never crash middleware in production; fail closed for protected routes.
    if (isProtectedAuthPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);
      loginUrl.searchParams.set('error', 'Session refresh failed. Please sign in again.');
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }
}
