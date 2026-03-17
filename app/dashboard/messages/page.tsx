'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getGymContext } from '@/lib/supabase/gym';
import type { Member, Message } from '@/lib/supabase/types';

type UiMessage = {
  id: string;
  recipient: string;
  channel: string;
  template: string;
  sentAt: string;
  status: string;
};

const templates = [
  { name: 'Renewal Reminder', body: 'Hi {{name}}, your plan is due for renewal. Reply to renew now.' },
  { name: 'Payment Due', body: 'Hi {{name}}, your pending payment is due today. Please clear it to continue access.' },
  { name: 'Class Reminder', body: 'Hi {{name}}, your class starts soon. We will see you at the gym.' },
  { name: 'Custom Message', body: 'Hi {{name}}, ' },
];

export default function MessagesPage() {
  const supabase = createClient();

  const [tab, setTab] = useState<'compose' | 'log'>('compose');
  const [gymId, setGymId] = useState('');
  const [userId, setUserId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    template: templates[0].name,
    audience: 'all',
    channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email',
    body: templates[0].body,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const ctx = await getGymContext(supabase);
      setGymId(ctx.gymId);
      setUserId(ctx.user.id);

      const [{ data: membersData, error: membersError }, { data: messagesData, error: messagesError }] = await Promise.all([
        supabase.from('members').select('*').eq('gym_id', ctx.gymId).order('created_at', { ascending: false }),
        supabase.from('messages').select('*').eq('gym_id', ctx.gymId).order('created_at', { ascending: false }).limit(100),
      ]);

      if (membersError) throw membersError;
      if (messagesError) throw messagesError;

      const membersList = (membersData ?? []) as Member[];
      setMembers(membersList);

      const memberNameById = new Map<string, string>(membersList.map((m) => [m.id, m.full_name]));

      const uiMessages = ((messagesData ?? []) as Message[]).map((m) => ({
        id: m.id,
        recipient: m.recipient_member_id ? memberNameById.get(m.recipient_member_id) ?? 'Member' : m.recipient_type,
        channel: m.channel,
        template: m.template_name ?? 'Custom',
        sentAt: new Date(m.sent_at).toLocaleString(),
        status: m.status,
      }));

      setMessages(uiMessages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load message data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    const total = messages.length;
    const delivered = messages.filter((m) => m.status === 'delivered' || m.status === 'read').length;
    const read = messages.filter((m) => m.status === 'read').length;
    const deliveryRate = total ? Math.round((delivered / total) * 100) : 0;
    const readRate = total ? Math.round((read / total) * 100) : 0;
    return { total, deliveryRate, readRate };
  }, [messages]);

  const getAudienceMembers = () => {
    if (form.audience === 'active') return members.filter((m) => m.status === 'active');
    if (form.audience === 'inactive') return members.filter((m) => m.status === 'inactive' || m.status === 'expired' || m.status === 'frozen');
    return members;
  };

  const handleTemplateChange = (name: string) => {
    const selected = templates.find((t) => t.name === name);
    setForm((prev) => ({
      ...prev,
      template: name,
      body: selected ? selected.body : prev.body,
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !userId) return;

    try {
      setSending(true);
      setError('');

      const recipients = getAudienceMembers();
      if (recipients.length === 0) {
        showToast('No recipients found for selected audience.');
        return;
      }

      const rows = recipients.map((m) => ({
        gym_id: gymId,
        recipient_member_id: m.id,
        recipient_type: 'individual' as const,
        template_name: form.template,
        channel: form.channel,
        body: form.body.replaceAll('{{name}}', m.full_name.split(' ')[0] ?? m.full_name),
        status: 'sent' as const,
        sent_by: userId,
      }));

      const { error: insertError } = await supabase.from('messages').insert(rows);
      if (insertError) throw insertError;

      showToast(`Saved ${rows.length} message(s) to delivery log.`);
      await loadData();
      setTab('log');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send messages.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}
      {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-sm text-muted mt-1">Compose and track client communication</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5"><p className="text-xs text-muted">Sent</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5"><p className="text-xs text-muted">Delivery Rate</p><p className="text-2xl font-bold">{stats.deliveryRate}%</p></div>
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5"><p className="text-xs text-muted">Read Rate</p><p className="text-2xl font-bold">{stats.readRate}%</p></div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-white/[0.06]">
        <button onClick={() => setTab('compose')} className={`px-5 py-3 text-sm font-medium border-b-2 ${tab === 'compose' ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>Compose</button>
        <button onClick={() => setTab('log')} className={`px-5 py-3 text-sm font-medium border-b-2 ${tab === 'log' ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>Delivery Log</button>
      </div>

      {tab === 'compose' && (
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-6 max-w-2xl">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Template</label>
              <select value={form.template} onChange={(e) => handleTemplateChange(e.target.value)} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                {templates.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Audience</label>
              <select value={form.audience} onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="all">All Members ({members.length})</option>
                <option value="active">Active Members ({members.filter((m) => m.status === 'active').length})</option>
                <option value="inactive">Inactive/Expired/Frozen ({members.filter((m) => m.status !== 'active').length})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Channel</label>
              <select value={form.channel} onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value as 'whatsapp' | 'sms' | 'email' }))} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Message Body</label>
              <textarea rows={5} value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white resize-none" />
              <p className="text-xs text-muted mt-1">Use {'{{name}}'} to insert recipient first name.</p>
            </div>
            <button type="submit" disabled={sending || loading || members.length === 0} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
              {sending ? 'Saving...' : 'Send and Save'}
            </button>
          </form>
        </div>
      )}

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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-muted">Loading logs...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-muted">No messages logged yet.</td></tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] last:border-0">
                    <td className="px-5 py-3 text-sm text-white/90">{m.recipient}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.template}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.channel}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.sentAt}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
