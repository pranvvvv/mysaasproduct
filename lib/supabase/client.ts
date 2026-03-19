import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseConfig } from './config';

const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'placeholder-anon-key';

// Client-side Supabase client — uses the anon key (safe for browser).
// All data access is gated by Row Level Security policies.
// NEVER import the service role key here.
export function createClient() {
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getPublicSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build-time prerender, client components are rendered on the server.
    // Return a harmless placeholder client so static generation doesn't crash.
    if (typeof window !== 'undefined') {
      const warningKey = '__supabase_env_warning_shown__';
      const warningStore = window as unknown as Record<string, boolean>;

      if (!warningStore[warningKey]) {
        warningStore[warningKey] = true;
        console.error(
          'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set both in Vercel Project Settings -> Environment Variables.'
        );
      }
    }

    return createBrowserClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY);
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
