'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getGymContext } from '@/lib/supabase/gym';
import type { Member as DbMember } from '@/lib/supabase/types';

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Expired' | 'Frozen';
  joinedAt: string;
};

type MessageDraft = {
  channel: 'whatsapp' | 'sms' | 'email';
  template: string;
  body: string;
};

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  status: 'Active' as MemberRow['status'],
};

const defaultDraft: MessageDraft = {
  channel: 'whatsapp',
  template: 'Custom Message',
  body: '',
};

function toUiMember(member: DbMember): MemberRow {
  const statusMap: Record<DbMember['status'], MemberRow['status']> = {
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    frozen: 'Frozen',
  };

  return {
    id: member.id,
    name: member.full_name,
    phone: member.phone,
    email: member.email ?? '',
    status: statusMap[member.status],
    joinedAt: member.joined_at,
  };
}

function toDbStatus(status: MemberRow['status']): DbMember['status'] {
  const map: Record<MemberRow['status'], DbMember['status']> = {
    Active: 'active',
    Inactive: 'inactive',
    Expired: 'expired',
    Frozen: 'frozen',
  };
  return map[status];
}

export default function MembersPage() {
  const supabase = createClient();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gymId, setGymId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<MemberRow | null>(null);
  const [showDelete, setShowDelete] = useState<MemberRow | null>(null);
  const [showMessage, setShowMessage] = useState<MemberRow | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [messageDraft, setMessageDraft] = useState(defaultDraft);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const ctx = await getGymContext(supabase);
      setGymId(ctx.gymId);
      setUserId(ctx.user.id);

      const { data, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('gym_id', ctx.gymId)
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;
      setMembers((data ?? []).map((m) => toUiMember(m as DbMember)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  }, [members, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;

    try {
      setSaving(true);
      setError('');

      const payload = {
        gym_id: gymId,
        full_name: form.name,
        phone: form.phone,
        email: form.email || null,
        status: toDbStatus(form.status),
      };

      const { data, error: insertError } = await supabase
        .from('members')
        .insert(payload)
        .select('*')
        .single();

      if (insertError) throw insertError;

      const newMember = toUiMember(data as DbMember);
      setMembers((prev) => [newMember, ...prev]);
      setShowAdd(false);
      setForm(emptyForm);
      showToast(`Member "${newMember.name}" added.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;

    try {
      setSaving(true);
      setError('');

      const { data, error: updateError } = await supabase
        .from('members')
        .update({
          full_name: form.name,
          phone: form.phone,
          email: form.email || null,
          status: toDbStatus(form.status),
        })
        .eq('id', showEdit.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      const updated = toUiMember(data as DbMember);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setShowEdit(null);
      setForm(emptyForm);
      showToast('Member updated.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;

    try {
      setSaving(true);
      setError('');

      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', showDelete.id);

      if (deleteError) throw deleteError;

      setMembers((prev) => prev.filter((m) => m.id !== showDelete.id));
      showToast(`Member "${showDelete.name}" deleted.`);
      setShowDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete member.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!showMessage || !gymId || !userId || !messageDraft.body.trim()) return;

    try {
      setSaving(true);
      setError('');

      const { error: messageError } = await supabase.from('messages').insert({
        gym_id: gymId,
        recipient_member_id: showMessage.id,
        recipient_type: 'individual',
        template_name: messageDraft.template,
        channel: messageDraft.channel,
        body: messageDraft.body.trim(),
        status: 'sent',
        sent_by: userId,
      });

      if (messageError) throw messageError;

      showToast(`Message logged for ${showMessage.name}.`);
      setShowMessage(null);
      setMessageDraft(defaultDraft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save message.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}
      {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-muted mt-1">{members.length} total members</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowAdd(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">
          Add Member
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
            className="bg-transparent text-sm text-white placeholder-muted w-full focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium">Member</th>
                <th className="text-left px-5 py-3.5 font-medium">Phone</th>
                <th className="text-left px-5 py-3.5 font-medium">Email</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 font-medium">Joined</th>
                <th className="text-right px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-muted">Loading members...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-muted">No members found.</td></tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-white/90">{m.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{m.phone}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{m.email || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{m.status}</td>
                    <td className="px-5 py-3.5 text-sm text-muted">{m.joinedAt}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setMessageDraft({ ...defaultDraft, body: `Hi ${m.name.split(' ')[0]}, ` }); setShowMessage(m); }} className="text-xs text-brand hover:underline">Message</button>
                        <button onClick={() => { setForm({ name: m.name, phone: m.phone, email: m.email, status: m.status }); setShowEdit(m); }} className="text-xs text-muted hover:text-white">Edit</button>
                        <button onClick={() => setShowDelete(m)} className="text-xs text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Add Member</h3>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MemberRow['status'] })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option>Active</option>
                <option>Inactive</option>
                <option>Expired</option>
                <option>Frozen</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-white/[0.08] py-2.5 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Edit Member</h3>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MemberRow['status'] })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option>Active</option>
                <option>Inactive</option>
                <option>Expired</option>
                <option>Frozen</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEdit(null)} className="flex-1 border border-white/[0.08] py-2.5 rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDelete(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete member?</h3>
            <p className="text-sm text-muted mb-4">This will remove {showDelete.name} permanently.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)} className="flex-1 border border-white/[0.08] py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm disabled:opacity-60">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {showMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowMessage(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-white/[0.06]"><h3 className="text-lg font-semibold">Send Message to {showMessage.name}</h3></div>
            <div className="p-6 space-y-4">
              <select value={messageDraft.channel} onChange={(e) => setMessageDraft({ ...messageDraft, channel: e.target.value as MessageDraft['channel'] })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
              <select value={messageDraft.template} onChange={(e) => setMessageDraft({ ...messageDraft, template: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white">
                <option>Custom Message</option>
                <option>Renewal Reminder</option>
                <option>Payment Due</option>
                <option>Class Reminder</option>
              </select>
              <textarea rows={4} value={messageDraft.body} onChange={(e) => setMessageDraft({ ...messageDraft, body: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setShowMessage(null)} className="flex-1 border border-white/[0.08] py-2.5 rounded-xl text-sm">Cancel</button>
                <button onClick={handleSendMessage} disabled={saving || !messageDraft.body.trim()} className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm disabled:opacity-60">{saving ? 'Sending...' : 'Send Message'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
