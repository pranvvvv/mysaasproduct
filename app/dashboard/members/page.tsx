'use client';
import { useState } from 'react';

interface Member {
  id: number; name: string; phone: string; email: string; plan: string; status: string; trainer: string; lastCheckin: string; expiry: string; joinDate: string;
}

const initialMembers: Member[] = [];

const emptyForm = { name: '', phone: '', email: '', plan: '', trainer: '', status: 'Active' };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTrainer, setFilterTrainer] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Member | null>(null);
  const [showDelete, setShowDelete] = useState<Member | null>(null);
  const [showDetail, setShowDetail] = useState<Member | null>(null);
  const [showMessage, setShowMessage] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !filterPlan || m.plan === filterPlan;
    const matchStatus = !filterStatus || m.status === filterStatus;
    const matchTrainer = !filterTrainer || m.trainer === filterTrainer;
    return matchSearch && matchPlan && matchStatus && matchTrainer;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = { id: Date.now(), name: form.name, phone: form.phone, email: form.email, plan: form.plan || 'Starter Monthly', trainer: form.trainer || 'Unassigned', status: 'Active', lastCheckin: 'Never', expiry: '2026-12-31', joinDate: new Date().toISOString().split('T')[0] };
    setMembers([newMember, ...members]);
    setShowAdd(false);
    setForm(emptyForm);
    showToast(`Member "${form.name}" added successfully!`);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setMembers(members.map(m => m.id === showEdit.id ? { ...m, name: form.name || m.name, phone: form.phone || m.phone, email: form.email || m.email, plan: form.plan || m.plan, trainer: form.trainer || m.trainer, status: form.status || m.status } : m));
    setShowEdit(null);
    setForm(emptyForm);
    showToast('Member updated successfully!');
  };

  const handleDelete = () => {
    if (!showDelete) return;
    setMembers(members.filter(m => m.id !== showDelete.id));
    showToast(`Member "${showDelete.name}" removed.`);
    setShowDelete(null);
  };

  const handleExport = () => {
    const csv = 'Name,Phone,Email,Plan,Status,Trainer,Last Check-in\n' + members.map(m => `${m.name},${m.phone},${m.email},${m.plan},${m.status},${m.trainer},${m.lastCheckin}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'members.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Members exported as CSV!');
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = { Active: 'bg-green-500/10 text-green-400', Expiring: 'bg-yellow-500/10 text-yellow-400', Lapsed: 'bg-red-500/10 text-red-400', Frozen: 'bg-blue-500/10 text-blue-400' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s[status] || 'bg-white/5 text-muted'}`}>{status}</span>;
  };

  const plans = Array.from(new Set(members.map(m => m.plan)));
  const statuses = Array.from(new Set(members.map(m => m.status)));
  const trainers = Array.from(new Set(members.map(m => m.trainer)));

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-muted mt-1">{members.length} total members · {members.filter(m=>m.status==='Active').length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="border border-white/[0.08] hover:bg-white/[0.03] text-sm text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, phone, or email..." className="bg-transparent text-sm text-white placeholder-muted w-full focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="text-muted hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>}
          </div>
        </div>
        <select value={filterPlan} onChange={e => { setFilterPlan(e.target.value); setPage(1); }} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors">
          <option value="">All Plans</option>
          {plans.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTrainer} onChange={e => { setFilterTrainer(e.target.value); setPage(1); }} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors">
          <option value="">All Trainers</option>
          {trainers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium">Member</th>
                <th className="text-left px-5 py-3.5 font-medium">Plan</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 font-medium">Trainer</th>
                <th className="text-left px-5 py-3.5 font-medium">Last Check-in</th>
                <th className="text-left px-5 py-3.5 font-medium">Expiry</th>
                <th className="text-right px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted text-sm">No members found.</td></tr>
              ) : paginated.map((m) => (
                <tr key={m.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <button onClick={() => setShowDetail(m)} className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">{m.name[0]}{m.name.split(' ')[1]?.[0]}</div>
                      <div>
                        <div className="text-sm font-medium text-white/90 hover:text-brand transition-colors">{m.name}</div>
                        <div className="text-xs text-muted">{m.phone}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">{m.plan}</td>
                  <td className="px-5 py-3.5">{statusBadge(m.status)}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{m.trainer}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{m.lastCheckin}</td>
                  <td className="px-5 py-3.5 text-sm text-muted">{m.expiry}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setShowMessage(m)} title="Send Message" className="p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      </button>
                      <button onClick={() => { setForm({ name: m.name, phone: m.phone, email: m.email, plan: m.plan, trainer: m.trainer, status: m.status }); setShowEdit(m); }} title="Edit" className="p-1.5 text-muted hover:text-white hover:bg-white/[0.05] rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button onClick={() => setShowDelete(m)} title="Delete" className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted">Showing {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1} className="px-3 py-1.5 text-xs text-muted hover:text-white border border-white/[0.06] rounded-lg disabled:opacity-30 transition-all">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${page === i+1 ? 'bg-brand text-white' : 'text-muted hover:text-white border border-white/[0.06]'}`}>{i+1}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page+1))} disabled={page===totalPages} className="px-3 py-1.5 text-xs text-muted hover:text-white border border-white/[0.06] rounded-lg disabled:opacity-30 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Add New Member</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Full Name *</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="Enter name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Phone *</label><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="+91..." /></div>
                <div><label className="block text-xs text-muted mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="email@..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Plan</label><select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value="">Select</option>{plans.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-xs text-muted mb-1.5">Trainer</label><select value={form.trainer} onChange={e => setForm({...form, trainer: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value="">Select</option>{trainers.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Edit Member</h3>
              <button onClick={() => setShowEdit(null)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Full Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Plan</label><select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">{plans.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-xs text-muted mb-1.5">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(null)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDelete(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-sm animate-fade-in p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Delete Member?</h3>
            <p className="text-sm text-muted mb-6">Are you sure you want to remove <strong className="text-white">{showDelete.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setShowDetail(null)}>
          <div className="bg-surface border-l border-white/[0.08] w-full max-w-md h-full overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Member Details</h3>
              <button onClick={() => setShowDetail(null)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xl font-bold">{showDetail.name[0]}{showDetail.name.split(' ')[1]?.[0]}</div>
                <div>
                  <div className="text-xl font-bold">{showDetail.name}</div>
                  <div className="text-sm text-muted">{showDetail.email}</div>
                  {statusBadge(showDetail.status)}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Phone', value: showDetail.phone },
                  { label: 'Plan', value: showDetail.plan },
                  { label: 'Trainer', value: showDetail.trainer },
                  { label: 'Last Check-in', value: showDetail.lastCheckin },
                  { label: 'Plan Expiry', value: showDetail.expiry },
                  { label: 'Join Date', value: showDetail.joinDate },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-sm text-muted">{item.label}</span>
                    <span className="text-sm text-white/90">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => { setShowDetail(null); setForm({ name: showDetail.name, phone: showDetail.phone, email: showDetail.email, plan: showDetail.plan, trainer: showDetail.trainer, status: showDetail.status }); setShowEdit(showDetail); }} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Edit Member</button>
                <button onClick={() => { setShowDetail(null); setShowMessage(showDetail); }} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowMessage(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Send Message to {showMessage.name}</h3>
              <button onClick={() => setShowMessage(null)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Channel</label><select className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option>WhatsApp</option><option>SMS</option><option>Email</option></select></div>
              <div><label className="block text-xs text-muted mb-1.5">Template</label><select className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option>Custom Message</option><option>Renewal Reminder</option><option>Payment Due</option><option>Birthday Wishes</option><option>Class Reminder</option></select></div>
              <div><label className="block text-xs text-muted mb-1.5">Message</label><textarea rows={4} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand resize-none" placeholder="Type your message..." defaultValue={`Hi ${showMessage.name.split(' ')[0]}, `} /></div>
              <div className="flex gap-3">
                <button onClick={() => setShowMessage(null)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button onClick={() => { showToast(`Message sent to ${showMessage.name} via WhatsApp!`); setShowMessage(null); }} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
