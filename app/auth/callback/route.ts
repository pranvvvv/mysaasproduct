import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/dashboard';
  }

  return nextPath;
}

function normalizeGymPlan(plan: string | null) {
  return plan === 'enterprise' || plan === 'pro' || plan === 'starter' ? plan : 'starter';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = normalizeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const portal = searchParams.get('portal') ?? String(user.user_metadata.account_type ?? 'staff');
        const intent = searchParams.get('intent') ?? String(user.user_metadata.auth_intent ?? 'login');

        if (portal === 'gym' && intent === 'signup') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('gym_id')
            .eq('id', user.id)
            .single();

          if (!profile?.gym_id) {
            const gymName = searchParams.get('gym_name') ?? String(user.user_metadata.gym_name ?? '');
            const fullName = searchParams.get('full_name') ?? String(user.user_metadata.full_name ?? user.email ?? 'Gym Owner');
            const branchCount = Number.parseInt(
              searchParams.get('branch_count') ?? String(user.user_metadata.branch_count ?? '1'),
              10
            );

            if (!gymName.trim()) {
              return NextResponse.redirect(`${origin}/login?portal=gym&mode=signup&error=Gym%20name%20is%20required%20to%20finish%20signup.`);
            }

            const { error: onboardingError } = await supabase.rpc('complete_gym_onboarding', {
              gym_name_input: gymName.trim(),
              gym_plan_input: normalizeGymPlan(searchParams.get('gym_plan') ?? String(user.user_metadata.gym_plan ?? 'starter')),
              full_name_input: fullName.trim(),
              branch_count_input: Number.isFinite(branchCount) && branchCount > 0 ? branchCount : 1,
            });

            if (onboardingError) {
              const loginUrl = new URL('/login', origin);
              loginUrl.searchParams.set('portal', 'gym');
              loginUrl.searchParams.set('mode', 'signup');
              loginUrl.searchParams.set('error', onboardingError.message);
              return NextResponse.redirect(loginUrl.toString());
            }
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login`);
}
