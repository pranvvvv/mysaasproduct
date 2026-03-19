'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'gym' | 'staff';

function getGymPlan(branchCountRaw: string) {
  const branchCount = Number.parseInt(branchCountRaw || '1', 10);
  return Number.isFinite(branchCount) && branchCount > 1 ? 'enterprise' : 'starter';
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>('gym');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [gymName, setGymName] = useState('');
  const [branchCount, setBranchCount] = useState('1');
  const [error, setError] = useState('');

  const gymPlanLabel = useMemo(() => {
    const plan = getGymPlan(branchCount);
    return plan === 'enterprise' ? 'Enterprise (Multi-branch)' : 'Starter (Single gym)';
  }, [branchCount]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?redirect=/onboarding');
        return;
      }

      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const inferredMode = metadata.account_type === 'staff' ? 'staff' : 'gym';

      const { data: gymId, error: gymIdError } = await supabase.rpc('get_user_gym_id');
      if (!gymIdError && gymId) {
        router.replace('/dashboard');
        return;
      }

      if (cancelled) {
        return;
      }

      setMode(inferredMode);
      setEmail(user.email ?? '');
      setFullName(
        typeof metadata.full_name === 'string' && metadata.full_name.trim()
          ? metadata.full_name
          : typeof metadata.name === 'string' && metadata.name.trim()
            ? metadata.name
            : ''
      );
      setGymName(typeof metadata.gym_name === 'string' ? metadata.gym_name : '');
      setBranchCount(String(metadata.branch_count ?? '1'));
      setLoading(false);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const completeGymOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!gymName.trim()) {
      setError('Gym name is required.');
      return;
    }

    const parsedBranchCount = Number.parseInt(branchCount || '1', 10);
    if (!Number.isFinite(parsedBranchCount) || parsedBranchCount < 1) {
      setError('Branch count must be at least 1.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login?redirect=/onboarding');
        return;
      }

      const gymPlan = getGymPlan(branchCount);

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          account_type: 'gym',
          auth_intent: 'signup',
          full_name: fullName.trim(),
          gym_name: gymName.trim(),
          branch_count: parsedBranchCount,
          gym_plan: gymPlan,
          role: 'owner',
        },
      });
      if (metadataError) throw metadataError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          email: user.email ?? '',
          role: 'owner',
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      const { error: onboardingError } = await supabase.rpc('complete_gym_onboarding', {
        gym_name_input: gymName.trim(),
        gym_plan_input: gymPlan,
        full_name_input: fullName.trim(),
        branch_count_input: parsedBranchCount,
      });
      if (onboardingError) throw onboardingError;

      router.replace('/dashboard?welcome=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete onboarding.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="bg-surface border border-white/[0.08] rounded-2xl px-6 py-5 flex items-center gap-3">
          <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-brand rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading your setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section className="space-y-6">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-brand/90 font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Final Step
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Build your gym workspace in under a minute.
            </h1>
            <p className="text-white/70 text-base max-w-xl">
              Your Google account is connected. We just need a few setup details to create your secure, multi-tenant gym dashboard.
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { title: 'Secure Auth', copy: 'Supabase session + RLS ready' },
                { title: 'Owner Controls', copy: 'Role and profile linked' },
                { title: 'Gym Workspace', copy: 'Schema bootstrapped instantly' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-surface/70 p-4 backdrop-blur">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted mt-1">{item.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-surface/90 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            {mode === 'staff' ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Staff account detected</h2>
                <p className="text-sm text-muted">
                  This account is marked as staff. Ask your gym owner to invite and assign your profile to a gym, then sign in again.
                </p>
                <div className="rounded-xl border border-white/[0.08] bg-dark p-4 text-sm text-white/90">
                  Signed in as: <span className="font-semibold">{email || 'Unknown email'}</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.replace('/login');
                  }}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <form onSubmit={completeGymOnboarding} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">Complete Gym Setup</h2>
                  <p className="text-sm text-muted mt-1">Linked to {email || 'your account'}</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-muted mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand"
                    placeholder="Aarav Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">Gym Name</label>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand"
                    placeholder="Prime Strength Club"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1.5">Number of Branches</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={branchCount}
                    onChange={(e) => setBranchCount(e.target.value)}
                    className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand"
                    placeholder="1"
                  />
                  <p className="text-xs text-muted mt-2">Detected plan tier: {gymPlanLabel}</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up workspace...
                    </>
                  ) : (
                    'Launch My Dashboard'
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
