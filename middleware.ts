import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protect dashboard routes only.
    '/dashboard/:path*',
    // Keep auth callback path in middleware flow for session refresh.
    '/auth/callback',
  ],
};
