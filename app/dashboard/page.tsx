'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getGymContext } from '@/lib/supabase/gym';
import type { Member } from '@/lib/supabase/types';

const emptyForm = { name: '', phone: '', email: '' };

export default function DashboardHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [gymId, setGymId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const ctx = await getGymContext(supabase);
      setGymId(ctx.gymId);

      const { data, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', ctx.gymId)
        .order('created_at', { ascending: false })
        .limit(8);

      if (membersError) throw membersError;
      setMembers((data ?? []) as Member[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  useEffect(() => {
    if (searchParams.get('welcome') === '1') {
      setShowWelcomeBanner(true);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('welcome');
      const nextQuery = nextParams.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const kpis = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'active').length;
    const newMembers = members.filter((m) => {
      const joined = new Date(m.joined_at);
      const now = new Date();
      return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
    }).length;

    return [
      { label: 'Total Members', value: String(totalMembers) },
      { label: 'Active Members', value: String(activeMembers) },
      { label: 'New This Month', value: String(newMembers) },
    ];
  }, [members]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;

    try {
      setSaving(true);
      setError('');

      const { data, error: insertError } = await supabase
        .from('members')
        .insert({
          gym_id: gymId,
          full_name: addForm.name,
          phone: addForm.phone,
          email: addForm.email || null,
          status: 'active',
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      setMembers((prev) => [data as Member, ...prev]);
      setShowAddModal(false);
      setAddForm(emptyForm);
      showToast(`Member "${addForm.name}" added successfully.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">
          {toast}
        </div>
      )}
      {showWelcomeBanner && (
        <div className="mb-4 rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/15 via-cyan-400/10 to-emerald-400/10 p-4 md:p-5 animate-slide-down">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand font-semibold">Workspace Ready</p>
              <h3 className="text-lg md:text-xl font-bold mt-1">Welcome to your gym command center.</h3>
              <p className="text-sm text-muted mt-1">
                Your onboarding is complete. Start by adding members, setting plans, and inviting your team from settings.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href="/dashboard/members" className="text-xs md:text-sm bg-brand hover:bg-brand-hover text-white px-3 py-2 rounded-lg font-medium transition-all">
                  Add Members
                </Link>
                <Link href="/dashboard/settings" className="text-xs md:text-sm border border-white/[0.12] hover:bg-white/[0.04] px-3 py-2 rounded-lg font-medium transition-all">
                  Open Settings
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcomeBanner(false)}
              className="text-muted hover:text-white transition-colors"
              aria-label="Dismiss welcome banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome</h2>
          <p className="text-sm text-muted mt-1">Your live gym dashboard overview.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-white/[0.06] rounded-2xl p-5">
            <div className="text-xs text-muted mb-2">{kpi.label}</div>
            <div className="text-2xl font-bold">{loading ? '...' : kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold">Recent Members</h3>
          <Link href="/dashboard/members" className="text-xs text-brand hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.04]">
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10 text-sm text-muted">Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-sm text-muted">No members yet.</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] last:border-0">
                    <td className="px-5 py-3 text-sm text-white/90">{m.full_name}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.phone}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.email ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Quick Add Member</h3>
              <input type="text" required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" placeholder="Full name" />
              <input type="tel" required value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" placeholder="Phone" />
              <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" placeholder="Email" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60">{saving ? 'Saving...' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
