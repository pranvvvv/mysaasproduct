'use client';
import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';

const features = [
  { icon: '👥', name: 'Member Management', desc: 'Complete member profiles, plans, and tracking in one place.', cat: 'Core' },
  { icon: '💳', name: 'Billing & Invoicing', desc: 'Auto-invoices, Razorpay payments, GST reports. Zero manual work.', cat: 'Core' },
  { icon: '📱', name: 'Attendance Tracking', desc: 'QR code, biometric, and RFID check-in — all synced live.', cat: 'Core' },
  { icon: '🎯', name: 'Lead CRM', desc: 'Kanban pipeline from lead capture to conversion. Never lose a lead.', cat: 'Growth' },
  { icon: '💬', name: 'WhatsApp Automation', desc: 'Auto reminders, payment receipts, birthday wishes — all on WhatsApp.', cat: 'Retention' },
  { icon: '🗓️', name: 'Class Scheduling', desc: 'Create classes, manage bookings, waitlists, and trainer assignments.', cat: 'Core' },
  { icon: '📊', name: 'Analytics Dashboard', desc: 'Revenue trends, churn signals, attendance patterns — all visualized.', cat: 'Intelligence' },
  { icon: '🏢', name: 'Multi-Branch', desc: 'Manage all locations from one dashboard with branch-level insights.', cat: 'Scale' },
  { icon: '📲', name: 'Member Mobile App', desc: 'White-label app for check-in, bookings, payments, and workout plans.', cat: 'Growth' },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: { monthly: 1999, yearly: 1599 },
    desc: 'For single-location gyms getting off the ground.',
    features: ['Up to 300 members', 'Member & plan management', 'Billing & invoice generation', 'QR code check-in', 'WhatsApp reminders (500/mo)', 'Basic analytics', 'Lead CRM (50 leads)', 'Email support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    price: { monthly: 3999, yearly: 3199 },
    desc: 'For serious operators who want every tool.',
    features: ['Unlimited members', 'Everything in Starter', 'Biometric + RFID attendance', 'Full Lead CRM pipeline', 'Class scheduling & booking', 'WhatsApp automation (unlimited)', 'Trainer & staff management', 'Member fitness tracking', 'White-label mobile app', 'Priority support + onboarding'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 0, yearly: 0 },
    desc: 'For gym chains and large multi-location operators.',
    features: ['Everything in Pro', 'Unlimited branches', 'Branch-level analytics', 'Custom API integrations', 'Dedicated account manager', '99.9% SLA uptime', 'Staff training & data migration', 'Custom reporting & exports'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function LandingPage() {
  const [yearly, setYearly] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', gym: '', phone: '', email: '', city: '', members: '' });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.gym || !demoForm.phone || !demoForm.email) {
      setDemoError('Please fill in all required fields.');
      return;
    }
    setDemoError('');
    setDemoSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="mygymsoftware" className="h-8 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:inline-flex text-sm text-muted hover:text-white transition-colors">
              Sign In
            </Link>
            <a href="#demo" className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all">
              Get a Free Demo →
            </a>
            <ThemeToggle />
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-muted hover:text-white">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {mobileMenu ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] px-6 py-4 animate-slide-down">
            <div className="flex flex-col gap-3 text-sm">
              <a href="#features" onClick={() => setMobileMenu(false)} className="text-muted hover:text-white py-1">Features</a>
              <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-muted hover:text-white py-1">Pricing</a>
              <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="text-muted hover:text-white py-1">How It Works</a>
              <a href="#demo" onClick={() => setMobileMenu(false)} className="text-muted hover:text-white py-1">Demo</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-brand-bg border border-brand/20 text-brand text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" /> Now in Beta — Join 2,400+ gyms
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
              Run your gym<br />smarter. <span className="text-brand">Not harder.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one operating system for modern gyms — members, billing, attendance, leads, classes. One dashboard.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Link href="/dashboard" className="bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-full text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                Start Free Trial
              </Link>
              <Link href="/dashboard" className="border border-white/10 hover:border-white/20 text-white font-medium px-8 py-3.5 rounded-full text-base transition-all hover:bg-white/[0.03]">
                See Dashboard →
              </Link>
            </div>
            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
              <span><strong className="text-white">2,400+</strong> gyms</span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span><strong className="text-white">₹18Cr</strong> revenue tracked</span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span><strong className="text-white">4.9★</strong> rating</span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span><strong className="text-white">94%</strong> retention</span>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden shadow-2xl shadow-brand/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-dark/60 rounded-md px-3 py-1.5 text-xs text-muted text-center max-w-md mx-auto">
                  www.mygymsftware.com/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="flex min-h-[420px]">
              {/* Mini sidebar */}
              <div className="w-48 bg-dark/50 border-r border-white/[0.06] p-4 hidden sm:block">
                <div className="text-sm font-bold mb-6"><img src="/logo.png" alt="" className="h-5 w-auto opacity-80" /></div>
                {['Dashboard', 'Members', 'Plans', 'Attendance', 'Billing', 'Analytics', 'Leads CRM'].map((item, i) => (
                  <div key={item} className={`text-xs py-2 px-3 rounded-lg mb-1 ${i === 0 ? 'bg-brand/10 text-brand font-medium' : 'text-muted hover:text-white/70'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-base font-semibold">Dashboard</div>
                    <div className="text-xs text-muted">Welcome back, Rahul</div>
                  </div>
                  <div className="bg-brand/10 text-brand text-xs px-3 py-1 rounded-full font-medium">+ Add Member</div>
                </div>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total Members', val: '847', change: '+12%' },
                    { label: 'Revenue (MTD)', val: '₹4.2L', change: '+8%' },
                    { label: 'Active Plans', val: '623', change: '+5%' },
                    { label: 'New Leads', val: '34', change: '+22%' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-surface-2/50 border border-white/[0.06] rounded-xl p-3">
                      <div className="text-[10px] text-muted mb-1">{kpi.label}</div>
                      <div className="text-lg font-bold">{kpi.val}</div>
                      <div className="text-[10px] text-brand font-medium">{kpi.change}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart */}
                <div className="bg-surface-2/50 border border-white/[0.06] rounded-xl p-4 mb-4">
                  <div className="text-xs text-muted mb-3">30-Day Attendance</div>
                  <div className="flex items-end gap-1 h-16">
                    {[40,55,45,70,60,80,75,65,90,85,70,95,80,60,75,88,92,78,86,72,68,82,90,76,84,88,94,82,90,96].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-brand/30 hover:bg-brand/60 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                {/* Mini table */}
                <div className="bg-surface-2/50 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="text-xs text-muted px-4 py-2 border-b border-white/[0.06]">Recent Members</div>
                  {[
                    { name: 'Priya Sharma', plan: 'Pro Yearly', status: 'Active' },
                    { name: 'Arjun Patel', plan: 'Starter Monthly', status: 'Expiring' },
                    { name: 'Sneha Gupta', plan: 'Pro Quarterly', status: 'Active' },
                  ].map((m) => (
                    <div key={m.name} className="flex items-center justify-between px-4 py-2 text-xs border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-[10px] text-brand font-bold">{m.name[0]}</div>
                        <span className="text-white/90">{m.name}</span>
                      </div>
                      <span className="text-muted">{m.plan}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-brand text-sm font-medium mb-3">Features</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything your gym needs. <span className="text-muted">Nothing it doesn&apos;t.</span></h2>
            <p className="text-muted max-w-xl mx-auto">Replace spreadsheets, WhatsApp groups, and manual billing with one powerful platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.name} className="group bg-surface border border-white/[0.06] rounded-2xl p-6 hover:border-brand/30 transition-all hover:bg-surface-2/50">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{f.cat}</span>
                </div>
                <h3 className="text-base font-semibold mb-2 group-hover:text-brand transition-colors">{f.name}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-brand text-sm font-medium mb-3">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Up and running in <span className="text-brand">under 15 minutes</span></h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign up & configure', desc: 'Create your account, add gym details, upload your logo, and set up membership plans.' },
              { step: '02', title: 'Import members', desc: 'Upload your existing member list via CSV or add members manually. We handle the rest.' },
              { step: '03', title: 'Go live', desc: 'Start tracking attendance, collecting payments, and managing leads from day one.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-black text-brand/20 mb-3">{s.step}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-brand text-sm font-medium mb-3">Pricing</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted mb-8">14-day free trial. No credit card required.</p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-surface border border-white/[0.08] rounded-full p-1">
              <button onClick={() => setYearly(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!yearly ? 'bg-brand text-white' : 'text-muted hover:text-white'}`}>
                Monthly
              </button>
              <button onClick={() => setYearly(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${yearly ? 'bg-brand text-white' : 'text-muted hover:text-white'}`}>
                Yearly <span className="text-xs text-brand ml-1">Save 20%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border transition-all ${plan.popular ? 'bg-brand/5 border-brand/40 scale-[1.02] shadow-xl shadow-brand/10' : 'bg-surface border-white/[0.08]'}`}>
                {plan.popular && (
                  <div className="text-xs font-semibold text-brand bg-brand/10 px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted mb-6">{plan.desc}</p>
                <div className="mb-6">
                  {plan.price.monthly > 0 ? (
                    <>
                      <span className="text-4xl font-black">₹{yearly ? plan.price.yearly.toLocaleString() : plan.price.monthly.toLocaleString()}</span>
                      <span className="text-muted text-sm">/month</span>
                      {yearly && <div className="text-xs text-brand mt-1">Billed ₹{(plan.price.yearly * 12).toLocaleString()}/year</div>}
                    </>
                  ) : (
                    <span className="text-4xl font-black">Custom</span>
                  )}
                </div>
                <Link href={plan.price.monthly > 0 ? '/dashboard' : '#demo'} className={`block text-center py-3 rounded-full text-sm font-semibold transition-all mb-8 ${plan.popular ? 'bg-brand hover:bg-brand-hover text-white' : 'border border-white/10 hover:border-white/20 text-white hover:bg-white/[0.03]'}`}>
                  {plan.cta}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO FORM */}
      <section id="demo" className="px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-brand text-sm font-medium mb-3">Book a Demo</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See mygymsoftware in action</h2>
            <p className="text-muted">Fill in your details and we&apos;ll schedule a personalized walkthrough within 24 hours.</p>
          </div>
          {demoSubmitted ? (
            <div className="bg-brand/10 border border-brand/30 rounded-2xl p-8 text-center animate-fade-in">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2">Demo Booked!</h3>
              <p className="text-muted">Thanks, {demoForm.name}! We&apos;ll reach out to you within 24 hours to schedule your personalized demo for <strong className="text-white">{demoForm.gym}</strong>.</p>
              <button onClick={() => { setDemoSubmitted(false); setDemoForm({ name: '', gym: '', phone: '', email: '', city: '', members: '' }); }} className="mt-6 text-brand text-sm hover:underline">
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="bg-surface border border-white/[0.08] rounded-2xl p-8">
              {demoError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg mb-6">{demoError}</div>}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Your Name *</label>
                  <input type="text" value={demoForm.name} onChange={e => setDemoForm({ ...demoForm, name: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="Rahul Mehta" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Gym Name *</label>
                  <input type="text" value={demoForm.gym} onChange={e => setDemoForm({ ...demoForm, gym: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="Iron Paradise Gym" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Phone *</label>
                  <input type="tel" value={demoForm.phone} onChange={e => setDemoForm({ ...demoForm, phone: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Email *</label>
                  <input type="email" value={demoForm.email} onChange={e => setDemoForm({ ...demoForm, email: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="rahul@ironparadise.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-muted mb-1.5">City</label>
                  <input type="text" value={demoForm.city} onChange={e => setDemoForm({ ...demoForm, city: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Number of Members</label>
                  <select value={demoForm.members} onChange={e => setDemoForm({ ...demoForm, members: e.target.value })} className="w-full bg-dark border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors">
                    <option value="">Select range</option>
                    <option value="<100">Less than 100</option>
                    <option value="100-500">100 – 500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3.5 rounded-full transition-all hover:scale-[1.01] active:scale-[0.99]">
                Book Your Free Demo →
              </button>
              <p className="text-xs text-muted text-center mt-4">We&apos;ll respond within 24 hours. No spam, ever.</p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-1">
              <img src="/logo.png" alt="mygymsoftware" className="h-8 w-auto mb-3" />
              <p className="text-sm text-muted leading-relaxed">Run your gym smarter. Not harder. The all-in-one operating system for modern gyms in India.</p>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="text-muted hover:text-white transition-colors">Dashboard</Link></li>
                <li><a href="#demo" className="text-muted hover:text-white transition-colors">Book Demo</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Company</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Legal</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-muted hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <span>© 2026 mygymsoftware. All rights reserved.</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
