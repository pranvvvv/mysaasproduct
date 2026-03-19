import Link from 'next/link';

const kpis = [
  { label: 'Total Members', value: '1,284', delta: '+14%' },
  { label: 'Revenue (MTD)', value: 'Rs 6.8L', delta: '+11%' },
  { label: 'Active Plans', value: '912', delta: '+7%' },
  { label: 'New Leads', value: '57', delta: '+24%' },
];

const recentMembers = [
  { name: 'Priya Sharma', plan: 'Pro Yearly', status: 'Active' },
  { name: 'Arjun Patel', plan: 'Starter Monthly', status: 'Expiring' },
  { name: 'Sneha Gupta', plan: 'Pro Quarterly', status: 'Active' },
  { name: 'Rohit Verma', plan: 'Transformation', status: 'Active' },
];

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <header className="border-b border-white/[0.08] bg-surface/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="primegymsoftware" className="h-8 w-auto" />
            <span className="text-xs px-2 py-1 rounded-full bg-brand/15 text-brand border border-brand/30">Live Demo</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login?portal=gym&mode=signup"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Preview</h1>
            <p className="text-sm text-muted mt-1">This is a read-only demo so visitors can see the product before signing up.</p>
          </div>
          <div className="text-xs text-muted bg-surface border border-white/[0.08] rounded-lg px-3 py-2">
            Sample data • Updated just now
          </div>
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-surface border border-white/[0.08] rounded-xl p-4">
              <div className="text-xs text-muted mb-2">{kpi.label}</div>
              <div className="text-2xl font-bold leading-tight">{kpi.value}</div>
              <div className="text-xs text-brand font-medium mt-1">{kpi.delta}</div>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-surface border border-white/[0.08] rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-4">30-Day Attendance Trend</h2>
            <div className="h-40 flex items-end gap-1">
              {[32, 45, 38, 54, 47, 62, 58, 65, 72, 68, 74, 70, 66, 79, 83, 76, 81, 73, 69, 77, 85, 88, 80, 84, 90, 86, 92, 87, 94, 96].map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t bg-gradient-to-t from-brand/30 to-brand/70"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <div className="bg-surface border border-white/[0.08] rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-4">Plan Distribution</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Starter</span>
                <span>32%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[32%] bg-brand" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Pro</span>
                <span>48%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[48%] bg-cyan-400" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted">Transformation</span>
                <span>20%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[20%] bg-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-white/[0.08] rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Members</h2>
            <span className="text-xs text-muted">Read-only preview</span>
          </div>
          {recentMembers.map((member) => (
            <div key={member.name} className="px-4 py-3 border-b border-white/[0.05] last:border-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold">
                  {member.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted">{member.plan}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  member.status === 'Active'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {member.status}
              </span>
            </div>
          ))}
        </section>

        <section className="bg-gradient-to-r from-brand/20 via-cyan-500/10 to-transparent border border-brand/30 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Like what you see?</h3>
            <p className="text-sm text-muted">Create your account to unlock the full dashboard, billing, CRM and automation.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login?portal=gym&mode=signup" className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Start Free Trial
            </Link>
            <Link href="/login" className="border border-white/15 hover:border-white/30 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
