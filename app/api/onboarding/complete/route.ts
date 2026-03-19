import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getServiceRoleSupabaseConfig } from '@/lib/supabase/config';

type CompleteOnboardingPayload = {
  fullName?: string;
  gymName?: string;
  branchCount?: number;
};

function getGymPlan(branchCount: number) {
  return branchCount > 1 ? 'enterprise' : 'starter';
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CompleteOnboardingPayload;
    const fullName = (payload.fullName ?? '').trim();
    const gymName = (payload.gymName ?? '').trim();
    const branchCount = Number.isFinite(payload.branchCount)
      ? Number(payload.branchCount)
      : Number.parseInt(String(payload.branchCount ?? '1'), 10);

    if (!fullName) {
      return badRequest('Full name is required.');
    }

    if (!gymName) {
      return badRequest('Gym name is required.');
    }

    if (!Number.isFinite(branchCount) || branchCount < 1) {
      return badRequest('Branch count must be at least 1.');
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { url, serviceRoleKey } = getServiceRoleSupabaseConfig();
    if (!url || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing server configuration for onboarding. Set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const admin = createSupabaseAdminClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingProfile, error: existingProfileError } = await admin
      .from('profiles')
      .select('gym_id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfileError) {
      return NextResponse.json({ error: existingProfileError.message }, { status: 500 });
    }

    if (existingProfile?.gym_id) {
      return NextResponse.json({ ok: true, gymId: existingProfile.gym_id }, { status: 200 });
    }

    const gymPlan = getGymPlan(branchCount);

    const { data: createdGym, error: createGymError } = await admin
      .from('gyms')
      .insert({
        name: gymName,
        plan: gymPlan,
        tagline: branchCount > 1 ? `${branchCount} gyms linked under one owner account` : null,
      })
      .select('id')
      .single();

    if (createGymError || !createdGym) {
      return NextResponse.json({ error: createGymError?.message ?? 'Failed to create gym.' }, { status: 500 });
    }

    const { error: updateProfileError } = await admin
      .from('profiles')
      .update({
        gym_id: createdGym.id,
        full_name: fullName,
        email: user.email ?? '',
        role: 'owner',
      })
      .eq('id', user.id);

    if (updateProfileError) {
      return NextResponse.json({ error: updateProfileError.message }, { status: 500 });
    }

    const { error: authMetadataError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata ?? {}),
        account_type: 'gym',
        auth_intent: 'signup',
        full_name: fullName,
        gym_name: gymName,
        branch_count: branchCount,
        gym_plan: gymPlan,
        role: 'owner',
      },
    });

    if (authMetadataError) {
      return NextResponse.json({ error: authMetadataError.message }, { status: 500 });
    }

    const { error: notificationError } = await admin
      .from('notification_settings')
      .upsert({ gym_id: createdGym.id }, { onConflict: 'gym_id' });

    if (notificationError) {
      return NextResponse.json({ error: notificationError.message }, { status: 500 });
    }

    const { error: integrationError } = await admin
      .from('integrations')
      .upsert({ gym_id: createdGym.id }, { onConflict: 'gym_id' });

    if (integrationError) {
      return NextResponse.json({ error: integrationError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, gymId: createdGym.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not complete onboarding.' },
      { status: 500 }
    );
  }
}
