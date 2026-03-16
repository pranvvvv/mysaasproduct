'use client';
import { useState } from 'react';

interface Invoice {
  id: number; member: string; plan: string; amount: number; gst: number; status: string; method: string; dueDate: string; paidAt: string;
}

const invoices: Invoice[] = [];

const revenueChart: { month: string; val: number }[] = [];

export default function BillingPage() {
  const [data, setData] = useState(invoices);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = data.filter(inv => {
    const matchSearch = inv.member.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = data.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const pendingAmount = data.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const overdueAmount = data.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const maxRev = revenueChart.length > 0 ? Math.max(...revenueChart.map(r => r.val)) : 1;

  const sendReminder = (inv: Invoice) => {
    showToast(`Payment reminder sent to ${inv.member} via WhatsApp!`);
  };

  const markPaid = (inv: Invoice) => {
    setData(data.map(i => i.id === inv.id ? { ...i, status: 'paid', method: 'Manual', paidAt: '2026-03-11' } : i));
    showToast(`Payment marked as received from ${inv.member}.`);
  };

  const handleExport = () => {
    const csv = 'ID,Member,Plan,Amount,GST,Status,Method,Due Date,Paid At\n' + filtered.map(i => `${i.id},${i.member},${i.plan},${i.amount},${i.gst},${i.status},${i.method},${i.dueDate},${i.paidAt}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'billing-report.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Billing report exported!');
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = { paid: 'bg-green-500/10 text-green-400', pending: 'bg-yellow-500/10 text-yellow-400', overdue: 'bg-red-500/10 text-red-400', failed: 'bg-red-500/10 text-red-400', refunded: 'bg-blue-500/10 text-blue-400' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${s[status] || 'bg-white/5 text-muted'}`}>{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Billing & Invoices</h2>
          <p className="text-sm text-muted mt-1">{data.length} invoices · Razorpay synced</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="border border-white/[0.08] hover:bg-white/[0.03] text-sm text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all">Export CSV</button>
          <button onClick={() => showToast('GST report generated!')} className="border border-white/[0.08] hover:bg-white/[0.03] text-sm text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all">GST Report</button>
        </div>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="text-xs text-muted mb-1">Revenue (MTD)</div>
          <div className="text-2xl font-bold text-brand">₹{(totalRevenue / 100000).toFixed(1)}L</div>
          <div className="text-xs text-green-400 mt-1">+8.3% vs last month</div>
        </div>
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="text-xs text-muted mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">₹{pendingAmount.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">{data.filter(i=>i.status==='pending').length} invoices</div>
        </div>
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="text-xs text-muted mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-400">₹{overdueAmount.toLocaleString()}</div>
          <div className="text-xs text-muted mt-1">{data.filter(i=>i.status==='overdue').length} invoices</div>
        </div>
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <div className="text-xs text-muted mb-1">Collected (Paid)</div>
          <div className="text-2xl font-bold text-green-400">{data.filter(i=>i.status==='paid').length}</div>
          <div className="text-xs text-muted mt-1">of {data.length} total</div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
        {revenueChart.length > 0 ? (
          <div className="flex items-end gap-4 h-40">
            {revenueChart.map(r => (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-muted">₹{(r.val/1000).toFixed(0)}K</div>
                <div className="w-full bg-brand/20 hover:bg-brand/40 rounded-t transition-all cursor-pointer" style={{ height: `${(r.val / maxRev) * 100}%` }} />
                <div className="text-xs text-muted">{r.month}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted">No revenue data yet</div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member..." className="bg-transparent text-sm text-white placeholder-muted w-full focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 font-medium">Invoice</th>
                <th className="text-left px-5 py-3.5 font-medium">Member</th>
                <th className="text-left px-5 py-3.5 font-medium">Plan</th>
                <th className="text-right px-5 py-3.5 font-medium">Amount</th>
                <th className="text-left px-5 py-3.5 font-medium">Status</th>
                <th className="text-left px-5 py-3.5 font-medium">Method</th>
                <th className="text-left px-5 py-3.5 font-medium">Due Date</th>
                <th className="text-right px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(inv => (
                <tr key={inv.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-brand font-mono">#{inv.id}</td>
                  <td className="px-5 py-3 text-sm text-white/90">{inv.member}</td>
                  <td className="px-5 py-3 text-sm text-muted">{inv.plan}</td>
                  <td className="px-5 py-3 text-sm text-white/90 text-right">₹{inv.amount.toLocaleString()}<br/><span className="text-[10px] text-muted">+₹{inv.gst} GST</span></td>
                  <td className="px-5 py-3">{statusBadge(inv.status)}</td>
                  <td className="px-5 py-3 text-sm text-muted">{inv.method}</td>
                  <td className="px-5 py-3 text-sm text-muted">{inv.dueDate}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {(inv.status === 'pending' || inv.status === 'overdue') && (
                        <>
                          <button onClick={() => sendReminder(inv)} title="Send Reminder" className="p-1.5 text-muted hover:text-brand hover:bg-brand/10 rounded-lg text-xs transition-all">Remind</button>
                          <button onClick={() => markPaid(inv)} title="Mark as Paid" className="p-1.5 text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg text-xs transition-all">Mark Paid</button>
                        </>
                      )}
                      {inv.status === 'paid' && (
                        <button onClick={() => showToast('Invoice PDF downloaded!')} className="p-1.5 text-muted hover:text-white hover:bg-white/[0.05] rounded-lg text-xs transition-all">PDF</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted">No invoices yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
