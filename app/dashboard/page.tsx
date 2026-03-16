'use client';
import { useState } from 'react';
import Link from 'next/link';

const kpis = [
  { label: 'Total Members', value: '0', change: '—', up: true, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Revenue (MTD)', value: '₹0', change: '—', up: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Active Plans', value: '0', change: '—', up: true, icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'New Leads', value: '0', change: '—', up: true, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const attendanceData: number[] = [];
const recentMembers: { id: number; name: string; phone: string; plan: string; status: string; lastCheckin: string }[] = [];
const renewals: { name: string; plan: string; daysLeft: number }[] = [];
const peakHours: { hour: string; val: number }[] = [];

export default function DashboardHome() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '', plan: '' });
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Member "${addForm.name}" added successfully!`);
    setShowAddModal(false);
    setAddForm({ name: '', phone: '', email: '', plan: '' });
  };

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome 👋</h2>
          <p className="text-sm text-muted mt-1">Here&apos;s your gym dashboard overview.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Member
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted">{kpi.label}</span>
              <svg className="w-5 h-5 text-brand/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} /></svg>
            </div>
            <div className="text-2xl font-bold mb-1">{kpi.value}</div>
            <div className="text-xs text-muted">{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Attendance chart */}
        <div className="lg:col-span-2 bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold">30-Day Attendance</h3>
              <p className="text-xs text-muted mt-0.5">Daily check-in volume</p>
            </div>
            <div className="text-xs text-muted bg-surface-2 px-3 py-1 rounded-lg">Last 30 days</div>
          </div>
          {attendanceData.length > 0 ? (
            <div className="flex items-end gap-[3px] h-40">
              {attendanceData.map((h, i) => (
                <div key={i} className="group relative flex-1">
                  <div className="bg-brand/20 hover:bg-brand/50 rounded-sm transition-all cursor-pointer" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-muted text-sm text-center">
              <div>
                <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                <p>No attendance data yet</p>
                <p className="text-xs mt-1">Check-in data will appear here once members start visiting.</p>
              </div>
            </div>
          )}
        </div>

        {/* Renewal alerts */}
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Renewal Alerts</h3>
            <span className="text-xs bg-white/[0.05] text-muted px-2 py-0.5 rounded-full font-medium">{renewals.length} upcoming</span>
          </div>
          {renewals.length > 0 ? (
            <div className="space-y-3">
              {renewals.map((r) => (
                <div key={r.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div>
                    <div className="text-sm text-white/90">{r.name}</div>
                    <div className="text-xs text-muted">{r.plan}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${r.daysLeft <= 1 ? 'text-red-400' : r.daysLeft <= 3 ? 'text-yellow-400' : 'text-muted'}`}>
                      {r.daysLeft}d left
                    </span>
                    <button onClick={() => showToast(`Reminder sent to ${r.name}`)} className="text-xs text-brand hover:underline">
                      Remind
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted text-sm text-center">
              <p>No upcoming renewals.<br/><span className="text-xs">Renewal alerts appear here as plans near expiry.</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent members */}
        <div className="lg:col-span-2 bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold">Recent Members</h3>
            <Link href="/dashboard/members" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          {recentMembers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3 font-medium">Member</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Last Check-in</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white/90">{m.name}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">{m.plan}</td>
                    <td className="px-5 py-3 text-xs">{m.status}</td>
                    <td className="px-5 py-3 text-sm text-muted">{m.lastCheckin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted text-sm text-center">
              <div>
                <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                <p>No members yet</p>
                <p className="text-xs mt-1">Click &quot;Add Member&quot; to get started.</p>
              </div>
            </div>
          )}
        </div>

        {/* Peak hours */}
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Peak Hours Today</h3>
          {peakHours.length > 0 ? (
          <div className="space-y-2">
            {peakHours.map((h) => (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="text-xs text-muted w-10 text-right">{h.hour}</span>
                <div className="flex-1 bg-surface-2 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${h.val > 80 ? 'bg-brand' : h.val > 50 ? 'bg-brand/60' : 'bg-brand/30'}`} style={{ width: `${h.val}%` }} />
                </div>
                <span className="text-xs text-muted w-8">{h.val}%</span>
              </div>
            ))}
          </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted text-sm text-center">
              <p>No check-in data yet.<br/><span className="text-xs">Peak hours appear once members check in.</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Quick Add Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Full Name *</label>
                <input type="text" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="Enter member name" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Phone *</label>
                <input type="tel" required value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Email</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="member@email.com" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Assign Plan</label>
                <select value={addForm.plan} onChange={e => setAddForm({ ...addForm, plan: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors">
                  <option value="">Select plan</option>
                  <option value="starter-monthly">Starter Monthly - ₹1,999</option>
                  <option value="pro-monthly">Pro Monthly - ₹3,999</option>
                  <option value="pro-quarterly">Pro Quarterly - ₹10,999</option>
                  <option value="pro-yearly">Pro Yearly - ₹38,390</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
