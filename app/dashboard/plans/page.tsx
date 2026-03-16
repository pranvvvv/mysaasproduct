'use client';
import { useState } from 'react';

interface Plan {
  id: number; name: string; duration: string; price: number; members: number; autoRenew: boolean; freezeAllowed: boolean; familyAddon: boolean; ptAddon: boolean; archived: boolean;
}

const initialPlans: Plan[] = [];

const emptyPlan = { name: '', duration: '30 days', price: '', autoRenew: true, freezeAllowed: false, familyAddon: false, ptAddon: false };

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [toast, setToast] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const activePlans = plans.filter(p => !p.archived);
  const archivedPlans = plans.filter(p => p.archived);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: Plan = { id: Date.now(), name: form.name, duration: form.duration, price: Number(form.price), members: 0, autoRenew: form.autoRenew, freezeAllowed: form.freezeAllowed, familyAddon: form.familyAddon, ptAddon: form.ptAddon, archived: false };
    setPlans([...plans, newPlan]);
    setShowCreate(false);
    setForm(emptyPlan);
    showToast(`Plan "${form.name}" created!`);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setPlans(plans.map(p => p.id === showEdit.id ? { ...p, name: form.name || p.name, duration: form.duration, price: Number(form.price) || p.price, autoRenew: form.autoRenew, freezeAllowed: form.freezeAllowed, familyAddon: form.familyAddon, ptAddon: form.ptAddon } : p));
    setShowEdit(null);
    setForm(emptyPlan);
    showToast('Plan updated!');
  };

  const toggleArchive = (plan: Plan) => {
    setPlans(plans.map(p => p.id === plan.id ? { ...p, archived: !p.archived } : p));
    showToast(plan.archived ? `Plan "${plan.name}" restored!` : `Plan "${plan.name}" archived.`);
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Membership Plans</h2>
          <p className="text-sm text-muted mt-1">{activePlans.length} active plans · {plans.reduce((s,p)=>s+p.members,0)} total subscriptions</p>
        </div>
        <button onClick={() => { setForm(emptyPlan); setShowCreate(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Plan
        </button>
      </div>

      {activePlans.length > 0 ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {activePlans.map(plan => (
          <div key={plan.id} className="bg-surface border border-white/[0.06] rounded-2xl p-6 hover:border-brand/20 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-xs text-muted">{plan.duration}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setForm({ name: plan.name, duration: plan.duration, price: String(plan.price), autoRenew: plan.autoRenew, freezeAllowed: plan.freezeAllowed, familyAddon: plan.familyAddon, ptAddon: plan.ptAddon }); setShowEdit(plan); }} className="p-1.5 text-muted hover:text-white hover:bg-white/[0.05] rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg></button>
                <button onClick={() => toggleArchive(plan)} className="p-1.5 text-muted hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg></button>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">₹{plan.price.toLocaleString()}<span className="text-sm text-muted font-normal">/{plan.duration === '30 days' ? 'mo' : plan.duration === '90 days' ? 'qtr' : 'yr'}</span></div>
            <div className="text-sm text-muted mb-4">{plan.members} active members</div>
            <div className="flex flex-wrap gap-2">
              {plan.autoRenew && <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full">Auto-renew</span>}
              {plan.freezeAllowed && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Freeze</span>}
              {plan.familyAddon && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Family</span>}
              {plan.ptAddon && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">PT</span>}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <div className="w-full bg-surface-2 rounded-full h-1.5">
                <div className="bg-brand rounded-full h-1.5" style={{ width: `${Math.min(100, (plan.members / 200) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted mt-1">{plan.members} / 200+ members</p>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-12 text-center mb-8">
          <svg className="w-12 h-12 mx-auto text-muted mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 011.15.564m-5.8 0c-.376.023-.75.05-1.124.08C7.095 3.007 6.25 3.97 6.25 5.108v15.642A2.25 2.25 0 008.5 23h7a2.25 2.25 0 002.25-2.25v-.878" /></svg>
          <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
          <p className="text-sm text-muted">Create your first membership plan to get started.</p>
        </div>
      )}

      {archivedPlans.length > 0 && (
        <div>
          <button onClick={() => setShowArchived(!showArchived)} className="text-sm text-muted hover:text-white mb-4 flex items-center gap-2">
            <svg className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            Archived Plans ({archivedPlans.length})
          </button>
          {showArchived && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedPlans.map(plan => (
                <div key={plan.id} className="bg-surface/50 border border-white/[0.04] rounded-2xl p-6 opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <button onClick={() => toggleArchive(plan)} className="text-xs text-brand hover:underline">Restore</button>
                  </div>
                  <div className="text-2xl font-bold">₹{plan.price.toLocaleString()}</div>
                  <p className="text-xs text-muted">{plan.duration} · Archived</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreate || showEdit) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setShowCreate(false); setShowEdit(null); }}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">{showEdit ? 'Edit Plan' : 'Create Plan'}</h3>
              <button onClick={() => { setShowCreate(false); setShowEdit(null); }} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={showEdit ? handleEdit : handleCreate} className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Plan Name *</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="e.g. Pro Monthly" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Duration</label><select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option>30 days</option><option>90 days</option><option>180 days</option><option>365 days</option></select></div>
                <div><label className="block text-xs text-muted mb-1.5">Price (₹) *</label><input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="1999" /></div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs text-muted mb-1">Options</label>
                {[
                  { key: 'autoRenew', label: 'Auto-renew' },
                  { key: 'freezeAllowed', label: 'Allow freeze' },
                  { key: 'familyAddon', label: 'Family add-on' },
                  { key: 'ptAddon', label: 'Personal training add-on' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => setForm({...form, [opt.key]: !(form as Record<string, unknown>)[opt.key]})} className={`w-10 h-5 rounded-full transition-all relative ${(form as Record<string, unknown>)[opt.key] ? 'bg-brand' : 'bg-surface-3 border border-white/[0.08]'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${(form as Record<string, unknown>)[opt.key] ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-white/80">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setShowEdit(null); }} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">{showEdit ? 'Save Changes' : 'Create Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
