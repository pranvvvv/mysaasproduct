'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Portal = 'staff' | 'gym';
type Mode = 'login' | 'signup';

function getGymPlan(branchCountRaw: string) {
  const branchCount = Number.parseInt(branchCountRaw || '1', 10);
  return Number.isFinite(branchCount) && branchCount > 1 ? 'enterprise' : 'starter';
}

export default function LoginPage() {
  const [portal, setPortal] = useState<Portal>('staff');
  const [mode, setMode] = useState<Mode>('login');
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymName, setGymName] = useState('');
  const [fullName, setFullName] = useState('');
  const [branchCount, setBranchCount] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPortal = params.get('portal');
    const requestedMode = params.get('mode');
    const authError = params.get('error');
    const authSuccess = params.get('success');
    const redirect = params.get('redirect');

    setPortal(requestedPortal === 'gym' ? 'gym' : 'staff');
    setMode(requestedMode === 'signup' ? 'signup' : 'login');
    setError(authError ?? '');
    setSuccess(authSuccess ?? '');
    setRedirectPath(redirect && redirect.startsWith('/') ? redirect : '/dashboard');
  }, []);

  const buildCallbackUrl = () => {
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', redirectPath);
    callbackUrl.searchParams.set('portal', portal);
    callbackUrl.searchParams.set('intent', mode);

    if (portal === 'gym' && mode === 'signup') {
      callbackUrl.searchParams.set('gym_name', gymName.trim());
      callbackUrl.searchParams.set('full_name', fullName.trim());
      callbackUrl.searchParams.set('branch_count', branchCount || '1');
      callbackUrl.searchParams.set('gym_plan', getGymPlan(branchCount));
    }

    return callbackUrl.toString();
  };

  const getAuthMetadata = () => ({
    full_name: fullName.trim(),
    role: portal === 'gym' ? 'owner' : 'staff',
    account_type: portal,
    auth_intent: mode,
    gym_name: portal === 'gym' ? gymName.trim() : undefined,
    branch_count: portal === 'gym' ? Number.parseInt(branchCount || '1', 10) : undefined,
    gym_plan: portal === 'gym' ? getGymPlan(branchCount) : undefined,
  });

  const validateGymSignup = () => {
    if (!fullName.trim()) {
      setError('Full name is required.');
      return false;
    }

    if (!gymName.trim()) {
      setError('Gym name is required.');
      return false;
    }

    const normalizedBranchCount = Number.parseInt(branchCount || '1', 10);
    if (!Number.isFinite(normalizedBranchCount) || normalizedBranchCount < 1) {
      setError('Branch count must be at least 1.');
      return false;
    }

    return true;
  };

  const handleGoogleAuth = async () => {
    setError('');
    setSuccess('');

    if (portal === 'gym' && mode === 'signup' && !validateGymSignup()) {
      return;
    }

    setLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildCallbackUrl(),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = redirectPath;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (!validateGymSignup()) {
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildCallbackUrl(),
        data: getAuthMetadata(),
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess('Check your email to confirm your account. We will finish setting up your gym after confirmation.');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (portal === 'gym' && mode === 'signup') {
      await handleSignup(e);
      return;
    }

    await handleLogin(e);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="primegymsoftware" className="h-10 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold">{portal === 'staff' ? 'Staff Access' : mode === 'login' ? 'Gym Owner Login' : 'Create Your Gym Account'}</h1>
          <p className="text-sm text-muted mt-1">
            {portal === 'staff'
              ? 'Sign in for staff, trainers, front desk, and managers.'
              : mode === 'login'
                ? 'Access your gym or multi-gym workspace.'
                : 'Create a dedicated gym owner portal with Supabase authentication.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 bg-surface border border-white/[0.08] rounded-2xl p-2">
          <button
            type="button"
            onClick={() => { setPortal('staff'); setMode('login'); setError(''); setSuccess(''); }}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${portal === 'staff' ? 'bg-brand text-white' : 'text-muted hover:text-white hover:bg-white/[0.03]'}`}
          >
            Staff Login
          </button>
          <button
            type="button"
            onClick={() => { setPortal('gym'); setError(''); setSuccess(''); }}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${portal === 'gym' ? 'bg-brand text-white' : 'text-muted hover:text-white hover:bg-white/[0.03]'}`}
          >
            Gym Portal
          </button>
        </div>

        {portal === 'gym' && (
          <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setMode(tab); setError(''); setSuccess(''); }}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all capitalize ${mode === tab ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Errors / Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-white/[0.08] rounded-2xl p-6 space-y-4">
          {portal === 'gym' && mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs text-muted mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  placeholder="Rahul Mehta"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Gym Name *</label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={e => setGymName(e.target.value)}
                  className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  placeholder="Iron Paradise Gym"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Number Of Gyms / Branches *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={branchCount}
                  onChange={e => setBranchCount(e.target.value)}
                  className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
                  placeholder="1"
                />
                <p className="text-xs text-muted mt-1">
                  {Number.parseInt(branchCount || '1', 10) > 1
                    ? 'Multi-gym accounts are treated as enterprise gym portals.'
                    : 'Single-gym accounts start on the standard owner portal.'}
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-muted mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              placeholder="you@gym.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              placeholder={portal === 'gym' && mode === 'signup' ? 'Min 8 characters' : '••••••••'}
              autoComplete={portal === 'gym' && mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full border border-white/[0.08] hover:bg-white/[0.03] text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.8-.1-1.2H12Z"/>
              <path fill="#34A853" d="M2.4 7.1l3.2 2.3C6.5 7.3 9 5.4 12 5.4c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-6.9 2.1-8.6 5.2Z"/>
              <path fill="#FBBC05" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.5-1.9.9-3.4.9-3.9 0-5.3-2.6-5.5-3.8l-3.2 2.4c1.7 3.2 5 5.3 8.7 5.3Z"/>
              <path fill="#4285F4" d="M21.1 14.3c0-.5-.1-.8-.1-1.2H12v3.9h5.5c-.3 1.1-1.1 2-2.1 2.6l3 2.4c1.8-1.7 2.7-4.1 2.7-7.7Z"/>
            </svg>
            {portal === 'gym' && mode === 'signup' ? 'Sign Up With Google' : 'Continue With Google'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {portal === 'gym' && mode === 'signup' ? 'Creating account...' : 'Signing in...'}</>
            ) : (
              portal === 'gym' && mode === 'signup' ? 'Create Gym Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted mt-6">
          {portal === 'staff' ? (
            <>Gym owners can use the gym portal to create an account and invite staff later.</>
          ) : mode === 'login' ? (
            <>Need a gym account?{' '}<button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} className="text-brand hover:underline font-medium">Create one here</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-brand hover:underline font-medium">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
