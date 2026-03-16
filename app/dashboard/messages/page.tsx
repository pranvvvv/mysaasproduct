'use client';
import { useState } from 'react';

interface Template {
  id: number; name: string; category: string; body: string; lastUsed: string; deliveryRate: number;
}

interface Message {
  id: number; to: string; template: string; channel: string; sentAt: string; status: 'Sent' | 'Delivered' | 'Read' | 'Failed'; phone: string;
}

const categories = ['All', 'Renewal', 'Payment', 'Class', 'Birthday', 'Festival', 'Promo'];

const initialTemplates: Template[] = [];

const recentMessages: Message[] = [];

const statusColors: Record<string, string> = {
  Sent: 'bg-yellow-500/10 text-yellow-400',
  Delivered: 'bg-blue-500/10 text-blue-400',
  Read: 'bg-green-500/10 text-green-400',
  Failed: 'bg-red-500/10 text-red-400',
};

export default function MessagesPage() {
  const [tab, setTab] = useState<'templates' | 'compose' | 'log'>('templates');
  const [catFilter, setCatFilter] = useState('All');
  const [showTemplate, setShowTemplate] = useState<Template | null>(null);
  const [toast, setToast] = useState('');
  const [composeForm, setComposeForm] = useState({ template: '', audience: 'all', channel: 'whatsapp', scheduled: false, scheduleDate: '', scheduleTime: '' });
  const [composeStatus, setComposeStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filteredTemplates = catFilter === 'All' ? initialTemplates : initialTemplates.filter(t => t.category === catFilter);

  const handleComposeSend = (e: React.FormEvent) => {
    e.preventDefault();
    setComposeStatus('sending');
    setTimeout(() => {
      setComposeStatus('sent');
      showToast(composeForm.scheduled ? `Message scheduled for ${composeForm.scheduleDate} at ${composeForm.scheduleTime}` : 'Message blast sent to selected audience!');
      setTimeout(() => { setComposeStatus('idle'); setComposeForm({ template: '', audience: 'all', channel: 'whatsapp', scheduled: false, scheduleDate: '', scheduleTime: '' }); }, 2000);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-sm text-muted mt-1">{initialTemplates.length} templates · {recentMessages.length} sent today</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sent Today', value: '0', arrow: '', change: '', desc: '—' },
          { label: 'Delivery Rate', value: '—', arrow: '', change: '', desc: 'no data' },
          { label: 'Read Rate', value: '—', arrow: '', change: '', desc: 'no data' },
          { label: 'WhatsApp Credits', value: '0', arrow: '', change: '', desc: 'configure in settings' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs text-muted mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.arrow && <span className={s.arrow === '↑' ? 'text-green-400' : 'text-red-400'}>{s.arrow} {s.change}</span>} {s.desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
        {(['templates', 'compose', 'log'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all capitalize ${tab === t ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-white/80'}`}>{t === 'log' ? 'Delivery Log' : t}</button>
        ))}
      </div>

      {/* Templates Tab */}
      {tab === 'templates' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${catFilter === c ? 'bg-brand text-white' : 'bg-white/[0.04] text-muted hover:text-white'}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.length > 0 ? filteredTemplates.map(t => (
              <div key={t.id} className="bg-surface border border-white/[0.06] rounded-2xl p-5 hover:border-brand/20 transition-all cursor-pointer" onClick={() => setShowTemplate(t)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold">{t.name}</h4>
                    <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{t.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Delivery</div>
                    <div className={`text-sm font-bold ${t.deliveryRate > 90 ? 'text-green-400' : t.deliveryRate > 80 ? 'text-yellow-400' : 'text-red-400'}`}>{t.deliveryRate}%</div>
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-2 mb-3">{t.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Last used {t.lastUsed}</span>
                  <button onClick={(e) => { e.stopPropagation(); setTab('compose'); setComposeForm(prev => ({...prev, template: t.name})); }} className="text-xs text-brand hover:underline">Use Template →</button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 bg-surface border border-white/[0.06] rounded-2xl p-12 text-center">
                <p className="text-sm text-muted">No templates yet. Create your first message template to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {tab === 'compose' && (
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">Compose Message Blast</h3>
          <form onSubmit={handleComposeSend} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Template *</label>
              <select required value={composeForm.template} onChange={e => setComposeForm({...composeForm, template: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
                <option value="">Select template</option>
                {initialTemplates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            {composeForm.template && (
              <div className="bg-dark border border-white/[0.06] rounded-xl p-4">
                <p className="text-xs text-muted mb-1">Preview:</p>
                <p className="text-sm text-white/80">{initialTemplates.find(t => t.name === composeForm.template)?.body}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Audience *</label>
                <select value={composeForm.audience} onChange={e => setComposeForm({...composeForm, audience: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
                  <option value="all">All Members</option>
                  <option value="active">Active Members</option>
                  <option value="expiring">Expiring This Month</option>
                  <option value="inactive">Inactive 30+ Days</option>
                  <option value="birthday">Birthdays This Week</option>
                  <option value="leads">All Leads</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Channel</label>
                <select value={composeForm.channel} onChange={e => setComposeForm({...composeForm, channel: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={composeForm.scheduled} onChange={e => setComposeForm({...composeForm, scheduled: e.target.checked})} className="sr-only peer" />
                <div className="w-9 h-5 bg-white/[0.08] rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <span className="text-sm text-muted">Schedule for later</span>
            </div>
            {composeForm.scheduled && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Date</label><input type="date" value={composeForm.scheduleDate} onChange={e => setComposeForm({...composeForm, scheduleDate: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Time</label><input type="time" value={composeForm.scheduleTime} onChange={e => setComposeForm({...composeForm, scheduleTime: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setComposeForm({ template: '', audience: 'all', channel: 'whatsapp', scheduled: false, scheduleDate: '', scheduleTime: '' })} className="border border-white/[0.08] hover:bg-white/[0.03] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">Clear</button>
              <button type="submit" disabled={composeStatus === 'sending'} className="bg-brand hover:bg-brand-hover text-white px-8 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {composeStatus === 'sending' ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : composeStatus === 'sent' ? '✓ Sent!' : composeForm.scheduled ? 'Schedule Send' : 'Send Now'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Log */}
      {tab === 'log' && (
        <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium">Recipient</th>
                <th className="text-left px-5 py-3.5 font-medium">Template</th>
                <th className="text-left px-5 py-3.5 font-medium">Channel</th>
                <th className="text-left px-5 py-3.5 font-medium">Sent</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-right px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentMessages.length > 0 ? recentMessages.map(m => (
                <tr key={m.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-sm font-medium text-white/90">{m.to}</div>
                    <div className="text-xs text-muted">{m.phone}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted">{m.template}</td>
                  <td className="px-5 py-3"><span className="text-xs text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{m.channel}</span></td>
                  <td className="px-5 py-3 text-sm text-muted">{m.sentAt}</td>
                  <td className="px-5 py-3"><span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{m.status}</span></td>
                  <td className="px-5 py-3 text-right">
                    {m.status === 'Failed' && <button onClick={() => showToast(`Resending to ${m.to}...`)} className="text-xs text-brand hover:underline">Resend</button>}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted">No messages sent yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Template Detail Modal */}
      {showTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplate(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-semibold">{showTemplate.name}</h3>
                <span className="text-xs text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{showTemplate.category}</span>
              </div>
              <button onClick={() => setShowTemplate(null)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6">
              <div className="bg-dark border border-white/[0.06] rounded-xl p-4 mb-4">
                <p className="text-sm text-white/80 leading-relaxed">{showTemplate.body}</p>
              </div>
              <div className="flex justify-between text-xs text-muted mb-4">
                <span>Last used: {showTemplate.lastUsed}</span>
                <span>Delivery rate: <span className="text-green-400 font-medium">{showTemplate.deliveryRate}%</span></span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setTab('compose'); setComposeForm(prev => ({...prev, template: showTemplate.name})); setShowTemplate(null); }} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Use This Template</button>
                <button onClick={() => setShowTemplate(null)} className="border border-white/[0.08] hover:bg-white/[0.03] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
