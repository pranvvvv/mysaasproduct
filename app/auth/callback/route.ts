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

function normalizePortal(portal: string | null) {
  return portal === 'gym' ? 'gym' : 'staff';
}

function normalizeIntent(intent: string | null) {
  return intent === 'signup' ? 'signup' : 'login';
}

function getUserDisplayName(
  fullNameParam: string | null,
  userMetadata: Record<string, unknown> | null,
  email: string | undefined
) {
  const fullNameFromParam = fullNameParam?.trim();
  if (fullNameFromParam) {
    return fullNameFromParam;
  }

  const fullNameFromMetadata =
    typeof userMetadata?.full_name === 'string' && userMetadata.full_name.trim()
      ? userMetadata.full_name.trim()
      : typeof userMetadata?.name === 'string' && userMetadata.name.trim()
        ? userMetadata.name.trim()
        : null;

  if (fullNameFromMetadata) {
    return fullNameFromMetadata;
  }

  if (email) {
    return email.split('@')[0];
  }

  return 'User';
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
        const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>;
        const portal = normalizePortal(searchParams.get('portal') ?? String(userMetadata.account_type ?? 'staff'));
        const intent = normalizeIntent(searchParams.get('intent') ?? String(userMetadata.auth_intent ?? 'login'));

        const fullName = getUserDisplayName(searchParams.get('full_name'), userMetadata, user.email);
        const gymNameFromParams = searchParams.get('gym_name')?.trim() ?? '';
        const gymNameFromMetadata = typeof userMetadata.gym_name === 'string' ? userMetadata.gym_name.trim() : '';
        const gymName = gymNameFromParams || gymNameFromMetadata;

        const branchCount = Number.parseInt(
          searchParams.get('branch_count') ?? String(userMetadata.branch_count ?? '1'),
          10
        );
        const normalizedBranchCount = Number.isFinite(branchCount) && branchCount > 0 ? branchCount : 1;

        const metadataUpdate: Record<string, unknown> = {
          account_type: portal,
          auth_intent: intent,
          full_name: fullName,
        };

        if (portal === 'gym') {
          metadataUpdate.gym_name = gymName;
          metadataUpdate.branch_count = normalizedBranchCount;
          metadataUpdate.gym_plan = normalizeGymPlan(
            searchParams.get('gym_plan') ?? String(userMetadata.gym_plan ?? 'starter')
          );
        }

        // Keep auth metadata in sync for future sessions (non-blocking).
        await supabase.auth.updateUser({ data: metadataUpdate });

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('gym_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          const loginUrl = new URL('/login', origin);
          loginUrl.searchParams.set('error', profileError.message);
          return NextResponse.redirect(loginUrl.toString());
        }

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            email: user.email ?? '',
            ...(portal === 'gym' && intent === 'signup' ? { role: 'owner' } : {}),
          })
          .eq('id', user.id);

        if (profileUpdateError) {
          const loginUrl = new URL('/login', origin);
          loginUrl.searchParams.set('error', profileUpdateError.message);
          return NextResponse.redirect(loginUrl.toString());
        }

        if (portal === 'gym' && intent === 'signup') {
          if (!profile?.gym_id) {
            if (!gymName.trim()) {
              return NextResponse.redirect(`${origin}/login?portal=gym&mode=signup&error=Gym%20name%20is%20required%20to%20finish%20signup.`);
            }

            const { error: onboardingError } = await supabase.rpc('complete_gym_onboarding', {
              gym_name_input: gymName.trim(),
              gym_plan_input: normalizeGymPlan(searchParams.get('gym_plan') ?? String(userMetadata.gym_plan ?? 'starter')),
              full_name_input: fullName.trim(),
              branch_count_input: normalizedBranchCount,
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
