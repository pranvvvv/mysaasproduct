'use client';
import { useState } from 'react';

interface Lead {
  id: number; name: string; phone: string; email: string; source: string; assignedTo: string; stage: string; notes: string; createdAt: string; lastActivity: string;
}

const stages = ['New', 'Contacted', 'Trial', 'Negotiation', 'Converted'];

const sourceColors: Record<string, string> = {
  Instagram: 'bg-pink-500/10 text-pink-400',
  Facebook: 'bg-blue-500/10 text-blue-400',
  'Walk-in': 'bg-green-500/10 text-green-400',
  Website: 'bg-brand/10 text-brand',
  Referral: 'bg-purple-500/10 text-purple-400',
  'Google Ads': 'bg-yellow-500/10 text-yellow-400',
};

const initialLeads: Lead[] = [];

const emptyLead = { name: '', phone: '', email: '', source: 'Walk-in', assignedTo: '', notes: '' };

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyLead);
  const [toast, setToast] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = { id: Date.now(), ...form, stage: 'New', createdAt: '2026-03-11', lastActivity: 'Just now' };
    setLeads([newLead, ...leads]);
    setShowAdd(false);
    setForm(emptyLead);
    showToast(`Lead "${form.name}" added!`);
  };

  const moveStage = (lead: Lead, direction: 'next' | 'prev') => {
    const idx = stages.indexOf(lead.stage);
    const newIdx = direction === 'next' ? Math.min(idx + 1, stages.length - 1) : Math.max(idx - 1, 0);
    if (newIdx === idx) return;
    setLeads(leads.map(l => l.id === lead.id ? { ...l, stage: stages[newIdx], lastActivity: 'Just now' } : l));
    showToast(`${lead.name} moved to ${stages[newIdx]}`);
  };

  const stageLeads = (stage: string) => leads.filter(l => l.stage === stage);

  const sources = Array.from(new Set(leads.map(l => l.source)));
  const sourceCounts = sources.map(s => ({ source: s, count: leads.filter(l => l.source === s).length })).sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Leads CRM</h2>
          <p className="text-sm text-muted mt-1">{leads.length} total leads · {leads.filter(l=>l.stage==='Converted').length} converted</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-surface border border-white/[0.06] rounded-xl p-0.5 flex">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'kanban' ? 'bg-brand text-white' : 'text-muted'}`}>Kanban</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-brand text-white' : 'text-muted'}`}>List</button>
          </div>
          <button onClick={() => { setForm(emptyLead); setShowAdd(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* Source analytics mini bar */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted">Lead Sources</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {sourceCounts.map(s => (
            <div key={s.source} className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[s.source] || 'bg-white/5 text-muted'}`}>{s.source}</span>
              <span className="text-xs font-bold text-white/90">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        /* Kanban Board */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{stage}</h3>
                  <span className="text-xs text-muted bg-white/[0.05] px-2 py-0.5 rounded-full">{stageLeads(stage).length}</span>
                </div>
              </div>
              <div className="space-y-2">
                {stageLeads(stage).map(lead => (
                  <div key={lead.id} className="bg-surface border border-white/[0.06] rounded-xl p-4 hover:border-brand/20 transition-all cursor-pointer group" onClick={() => setShowDetail(lead)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium text-white/90">{lead.name}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${sourceColors[lead.source]}`}>{lead.source}</span>
                    </div>
                    <div className="text-xs text-muted mb-2">{lead.notes}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted">{lead.lastActivity}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {stages.indexOf(stage) > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); moveStage(lead, 'prev'); }} className="p-1 bg-white/[0.05] rounded text-muted hover:text-white text-xs" title="Move back">←</button>
                        )}
                        {stages.indexOf(stage) < stages.length - 1 && (
                          <button onClick={(e) => { e.stopPropagation(); moveStage(lead, 'next'); }} className="p-1 bg-brand/10 rounded text-brand hover:bg-brand/20 text-xs" title="Move forward">→</button>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted mt-2 pt-2 border-t border-white/[0.04]">Assigned: {lead.assignedTo}</div>
                  </div>
                ))}
                {stageLeads(stage).length === 0 && (
                  <div className="border border-dashed border-white/[0.06] rounded-xl p-6 text-center">
                    <p className="text-xs text-muted">No leads</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium">Lead</th>
                <th className="text-left px-5 py-3.5 font-medium">Source</th>
                <th className="text-left px-5 py-3.5 font-medium">Stage</th>
                <th className="text-left px-5 py-3.5 font-medium">Assigned</th>
                <th className="text-left px-5 py-3.5 font-medium">Last Activity</th>
                <th className="text-right px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setShowDetail(lead)}>
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-white/90">{lead.name}</div>
                    <div className="text-xs text-muted">{lead.phone}</div>
                  </td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[lead.source]}`}>{lead.source}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">{lead.stage}</span></td>
                  <td className="px-5 py-3 text-sm text-muted">{lead.assignedTo}</td>
                  <td className="px-5 py-3 text-sm text-muted">{lead.lastActivity}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stages.indexOf(lead.stage) < stages.length - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); moveStage(lead, 'next'); }} className="text-xs text-brand hover:underline">Advance →</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Add New Lead</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Full Name *</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="Lead name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Phone *</label><input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="+91..." /></div>
                <div><label className="block text-xs text-muted mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="email@..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Source</label><select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option>Walk-in</option><option>Instagram</option><option>Facebook</option><option>Website</option><option>Referral</option><option>Google Ads</option></select></div>
                <div><label className="block text-xs text-muted mb-1.5">Assign To</label><select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value="">Select</option><option>Deepak</option><option>Suman</option><option>Ravi</option></select></div>
              </div>
              <div><label className="block text-xs text-muted mb-1.5">Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand resize-none" placeholder="Initial notes..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Lead Details</h3>
              <button onClick={() => setShowDetail(null)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-brand font-bold">{showDetail.name[0]}</div>
                <div>
                  <h4 className="text-lg font-semibold">{showDetail.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${sourceColors[showDetail.source]}`}>{showDetail.source}</span>
                    <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full">{showDetail.stage}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { l: 'Phone', v: showDetail.phone },
                  { l: 'Email', v: showDetail.email || '—' },
                  { l: 'Assigned To', v: showDetail.assignedTo },
                  { l: 'Notes', v: showDetail.notes || '—' },
                  { l: 'Created', v: showDetail.createdAt },
                  { l: 'Last Activity', v: showDetail.lastActivity },
                ].map(i => (
                  <div key={i.l} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-muted">{i.l}</span>
                    <span className="text-sm text-white/90 text-right max-w-[60%]">{i.v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {stages.indexOf(showDetail.stage) > 0 && (
                  <button onClick={() => { moveStage(showDetail, 'prev'); setShowDetail(null); }} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">← Move Back</button>
                )}
                {stages.indexOf(showDetail.stage) < stages.length - 1 && (
                  <button onClick={() => { moveStage(showDetail, 'next'); setShowDetail(null); }} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Advance →</button>
                )}
                <button onClick={() => { showToast(`WhatsApp sent to ${showDetail.name}`); setShowDetail(null); }} className="px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm transition-all">WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
