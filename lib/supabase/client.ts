import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client — uses the anon key (safe for browser).
// All data access is gated by Row Level Security policies.
// NEVER import the service role key here.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build-time prerender, client components are rendered on the server.
    // Return a harmless placeholder client so static generation doesn't crash.
    if (typeof window === 'undefined') {
      return createBrowserClient('https://placeholder.supabase.co', 'placeholder-anon-key');
    }

    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in Vercel Project Settings -> Environment Variables.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
