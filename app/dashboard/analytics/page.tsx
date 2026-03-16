'use client';
import { useState, useEffect } from 'react';

const revenueData: { m: string; v: number }[] = [];

const memberGrowth: { m: string; v: number }[] = [];

const planDist: { name: string; val: number; color: string }[] = [];

const funnelData: { stage: string; val: number; pct: number }[] = [];

const churnRisks: { name: string; reason: string; risk: string }[] = [];

const attendanceHeatmap: { day: string; hours: number[] }[] = [];

export default function AnalyticsPage() {
  const [range, setRange] = useState('9months');
  const [toast, setToast] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const maxRev = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.v)) : 1;
  const maxMem = memberGrowth.length > 0 ? Math.max(...memberGrowth.map(d => d.v)) : 1;
  const totalPlan = planDist.reduce((s, p) => s + p.val, 0) || 1;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted mt-1">Performance insights and trends</p>
        </div>
        <div className="flex gap-2">
          <select value={range} onChange={e => setRange(e.target.value)} className="bg-surface border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="9months">Last 9 months</option>
            <option value="12months">Last 12 months</option>
          </select>
          <button onClick={() => showToast('PDF report downloading...')} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">Export PDF</button>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Revenue Trend</h3>
          <p className="text-xs text-muted mb-4">Monthly revenue in thousands (₹K)</p>
          {revenueData.length > 0 ? (
            <div className="flex items-end gap-3 h-44">
              {revenueData.map(d => (
                <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-muted">₹{d.v}K</div>
                  <div className="w-full bg-brand/20 hover:bg-brand/50 rounded-t transition-all cursor-pointer" style={{ height: `${(d.v / maxRev) * 100}%` }} />
                  <div className="text-[10px] text-muted">{d.m}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm text-muted">No revenue data yet</div>
          )}
        </div>

        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Member Growth</h3>
          <p className="text-xs text-muted mb-4">Total active members</p>
          {memberGrowth.length > 0 ? (
            <div className="relative h-44">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`M0,${160 - (memberGrowth[0].v / maxMem) * 140} ${memberGrowth.map((d, i) => `L${(i / (memberGrowth.length - 1)) * 400},${160 - (d.v / maxMem) * 140}`).join(' ')} L400,160 L0,160 Z`} fill="url(#areaGrad)" />
                <path d={`M0,${160 - (memberGrowth[0].v / maxMem) * 140} ${memberGrowth.map((d, i) => `L${(i / (memberGrowth.length - 1)) * 400},${160 - (d.v / maxMem) * 140}`).join(' ')}`} fill="none" stroke="#2563EB" strokeWidth="2" />
                {memberGrowth.map((d, i) => (
                  <circle key={d.m} cx={(i / (memberGrowth.length - 1)) * 400} cy={160 - (d.v / maxMem) * 140} r="3" fill="#2563EB" />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted px-1">
                {memberGrowth.map(d => <span key={d.m}>{d.m}</span>)}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm text-muted">No member data yet</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Lead Funnel */}
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Lead Conversion Funnel</h3>
          {funnelData.length > 0 ? (
            <div className="space-y-3">
              {funnelData.map(f => (
                <div key={f.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">{f.stage}</span>
                    <span className="text-white/90">{f.val} ({f.pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-3">
                    <div className="bg-brand rounded-full h-3 transition-all" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted">No lead data yet</div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Plan Distribution</h3>
          {planDist.length > 0 ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let offset = 0;
                      return planDist.map(p => {
                        const pct = (p.val / totalPlan) * 100;
                        const dash = pct * 2.51327;
                        const gap = 251.327 - dash;
                        const el = <circle key={p.name} cx="50" cy="50" r="40" fill="none" stroke={p.color} strokeWidth="18" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * 2.51327} />;
                        offset += pct;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold">{planDist.reduce((s, p) => s + p.val, 0)}</div>
                    <div className="text-[10px] text-muted">members</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {planDist.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-muted">{p.name}</span>
                    </div>
                    <span className="text-white/90">{p.val} ({((p.val / totalPlan) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted">No plan data yet</div>
          )}
        </div>

        {/* Churn Signals */}
        <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1">Churn Signals</h3>
          <p className="text-xs text-muted mb-4">Members at risk of lapsing</p>
          {churnRisks.length > 0 ? (
            <div className="space-y-3">
              {churnRisks.map(c => (
                <div key={c.name} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.risk === 'High' ? 'bg-red-400' : c.risk === 'Medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                  <div className="flex-1">
                    <div className="text-sm text-white/90">{c.name}</div>
                    <div className="text-xs text-muted">{c.reason}</div>
                  </div>
                  <button onClick={() => showToast(`Outreach sent to ${c.name}`)} className="text-xs text-brand hover:underline flex-shrink-0">Reach out</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-muted">No churn signals detected</div>
          )}
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Attendance Heatmap (Hour × Day)</h3>
        {attendanceHeatmap.length > 0 ? (
          <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex gap-1 mb-1">
              <div className="w-10" />
              {Array.from({ length: 16 }, (_, i) => i + 6).map(h => (
                <div key={h} className="flex-1 text-center text-[10px] text-muted">{h > 12 ? h-12 : h}{h >= 12 ? 'p' : 'a'}</div>
              ))}
            </div>
            {attendanceHeatmap.map(row => (
              <div key={row.day} className="flex gap-1 mb-1">
                <div className="w-10 text-xs text-muted flex items-center">{row.day}</div>
                {row.hours.map((val, i) => {
                  const intensity = val / 95;
                  return (
                    <div key={i} className="flex-1 h-6 rounded cursor-pointer transition-all hover:scale-110 group relative" style={{ backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.7})` }}>
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-surface-3 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 border border-white/[0.08]">{val}%</div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted">
              <span>Low</span>
              <div className="flex gap-0.5">{[0.15,0.3,0.45,0.6,0.75].map(o => <div key={o} className="w-4 h-3 rounded" style={{ backgroundColor: `rgba(37, 99, 235, ${o})` }} />)}</div>
              <span>High</span>
            </div>
          </div>
        </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-muted">No attendance data yet</div>
        )}
      </div>
    </div>
  );
}
