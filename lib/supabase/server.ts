import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabaseConfig } from './config';

// Server-side Supabase client for Server Components / Route Handlers / Server Actions.
// Uses anon key + cookie-based auth. RLS enforced per user session.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getServerSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase server configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignored in Server Components (read-only)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}
