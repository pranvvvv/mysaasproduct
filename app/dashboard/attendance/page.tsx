'use client';
import { useState } from 'react';

const methods = ['QR', 'Biometric', 'RFID', 'App'];

interface AttendanceLog { id: number; name: string; method: string; checkedIn: string; checkedOut: string; date: string; }

const initialLogs: AttendanceLog[] = [];

const peakData: { hour: string; count: number }[] = [];

export default function AttendancePage() {
  const [logs] = useState<AttendanceLog[]>(initialLogs);
  const [date, setDate] = useState('2026-03-11');
  const [filterMethod, setFilterMethod] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = logs.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchMethod = !filterMethod || l.method === filterMethod;
    return matchSearch && matchMethod;
  });

  const maxPeak = peakData.length > 0 ? Math.max(...peakData.map(p => p.count)) : 1;

  const handleExport = () => {
    const csv = 'Name,Method,Check In,Check Out,Date\n' + filtered.map(l => `${l.name},${l.method},${l.checkedIn},${l.checkedOut},${l.date}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `attendance-${date}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Attendance exported!');
  };

  const methodBadge = (method: string) => {
    const s: Record<string, string> = { QR: 'bg-brand/10 text-brand', Biometric: 'bg-green-500/10 text-green-400', RFID: 'bg-purple-500/10 text-purple-400', App: 'bg-yellow-500/10 text-yellow-400' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s[method]}`}>{method}</span>;
  };

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Attendance</h2>
          <p className="text-sm text-muted mt-1">{filtered.length} check-ins today · Live log</p>
        </div>
        <button onClick={handleExport} className="border border-white/[0.08] hover:bg-white/[0.03] text-sm text-muted hover:text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Today\'s Check-ins', value: filtered.length, color: 'text-brand' },
          { label: 'Avg. Duration', value: '—', color: 'text-white' },
          { label: 'Peak Hour', value: '—', color: 'text-yellow-400' },
          { label: 'QR Scans', value: filtered.filter(l=>l.method==='QR').length, color: 'text-brand' },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-white/[0.06] rounded-2xl p-4">
            <div className="text-xs text-muted mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Peak Hours chart */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Peak Hours</h3>
        {peakData.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {peakData.map(p => (
              <div key={p.hour} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-muted">{p.count}</div>
                <div className="w-full bg-brand/20 hover:bg-brand/40 rounded-t transition-all cursor-pointer" style={{ height: `${(p.count / maxPeak) * 100}%` }} />
                <div className="text-[10px] text-muted">{p.hour}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-muted">No attendance data yet</div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member..." className="bg-transparent text-sm text-white placeholder-muted w-full focus:outline-none" />
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" />
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
          <option value="">All Methods</option>
          {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted border-b border-white/[0.06]">
              <th className="text-left px-5 py-3.5 font-medium">#</th>
              <th className="text-left px-5 py-3.5 font-medium">Member</th>
              <th className="text-left px-5 py-3.5 font-medium">Method</th>
              <th className="text-left px-5 py-3.5 font-medium">Check In</th>
              <th className="text-left px-5 py-3.5 font-medium">Check Out</th>
              <th className="text-left px-5 py-3.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((log, idx) => (
              <tr key={log.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 text-xs text-muted">{idx + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center text-brand text-[10px] font-bold">{log.name[0]}</div>
                    <span className="text-sm text-white/90">{log.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">{methodBadge(log.method)}</td>
                <td className="px-5 py-3 text-sm text-white/80">{log.checkedIn}</td>
                <td className="px-5 py-3 text-sm text-muted">{log.checkedOut}</td>
                <td className="px-5 py-3 text-sm text-muted">{log.date}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-muted">No check-ins recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
