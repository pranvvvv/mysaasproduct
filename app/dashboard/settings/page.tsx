'use client';
import { useState } from 'react';

const tabs = ['Gym Info', 'Branding', 'Staff & Roles', 'Integrations', 'Notifications', 'Billing'];

interface Staff { id: number; name: string; role: string; email: string; status: 'Active' | 'Inactive'; }

const initialStaff: Staff[] = [];

function InputField({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors" />
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Gym Info');
  const [toast, setToast] = useState('');
  const [staff, setStaff] = useState(initialStaff);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Trainer', email: '' });

  // Gym Info
  const [gym, setGym] = useState({ name: '', address: '', phone: '', email: '', website: '', gst: '', branches: '' });

  // Branding
  const [branding, setBranding] = useState({ primaryColor: '#2563EB', logo: '', tagline: '' });

  // Integrations
  const [integrations, setIntegrations] = useState({ razorpay: false, razorpayKey: '', whatsapp: false, whatsappKey: '', biometric: false, googleCalendar: false });

  // Notifications
  const [notifs, setNotifs] = useState({ renewalReminder: true, paymentReceipt: true, classReminder: true, birthday: true, inactiveNudge: true, renewDaysBefore: '7', reminderTime: '09:00' });

  // Billing
  const [billing, setBilling] = useState({ plan: '', billingCycle: '', nextBilling: '', amount: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = () => showToast('Settings saved successfully!');

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-muted mt-1">Manage your gym configuration</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-surface border border-white/[0.06] rounded-2xl p-2 space-y-0.5">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'bg-brand/10 text-brand' : 'text-muted hover:text-white hover:bg-white/[0.03]'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface border border-white/[0.06] rounded-2xl p-6">
          {/* Gym Info */}
          {activeTab === 'Gym Info' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-semibold">Gym Information</h3>
              <InputField label="Gym Name" value={gym.name} onChange={v => setGym({...gym, name: v})} />
              <InputField label="Address" value={gym.address} onChange={v => setGym({...gym, address: v})} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Phone" value={gym.phone} onChange={v => setGym({...gym, phone: v})} type="tel" />
                <InputField label="Email" value={gym.email} onChange={v => setGym({...gym, email: v})} type="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Website" value={gym.website} onChange={v => setGym({...gym, website: v})} />
                <InputField label="GST Number" value={gym.gst} onChange={v => setGym({...gym, gst: v})} />
              </div>
              <InputField label="Number of Branches" value={gym.branches} onChange={v => setGym({...gym, branches: v})} type="number" />
              <button onClick={handleSave} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">Save Changes</button>
            </div>
          )}

          {/* Branding */}
          {activeTab === 'Branding' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-semibold">Branding</h3>
              <div>
                <label className="block text-xs text-muted mb-1.5">Gym Logo</label>
                <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center hover:border-brand/30 transition-colors cursor-pointer">
                  <svg className="w-8 h-8 mx-auto text-muted mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  <p className="text-sm text-muted">Click to upload logo</p>
                  <p className="text-xs text-muted mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-12 h-12 rounded-xl bg-transparent cursor-pointer border-0" />
                  <input type="text" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand w-32" />
                  <div className="w-32 h-10 rounded-xl" style={{ backgroundColor: branding.primaryColor }} />
                </div>
              </div>
              <InputField label="Tagline" value={branding.tagline} onChange={v => setBranding({...branding, tagline: v})} placeholder="Your gym's tagline" />
              <div>
                <label className="block text-xs text-muted mb-1.5">Preview</label>
                <div className="bg-dark border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: branding.primaryColor }}>F</div>
                    <div>
                      <div className="font-semibold text-sm">{gym.name}</div>
                      <div className="text-xs text-muted">{branding.tagline}</div>
                    </div>
                  </div>
                  <button className="text-sm text-white px-4 py-2 rounded-lg" style={{ backgroundColor: branding.primaryColor }}>Sample Button</button>
                </div>
              </div>
              <button onClick={handleSave} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">Save Changes</button>
            </div>
          )}

          {/* Staff & Roles */}
          {activeTab === 'Staff & Roles' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Staff & Roles</h3>
                <button onClick={() => { setStaffForm({ name: '', role: 'Trainer', email: '' }); setShowAddStaff(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Staff
                </button>
              </div>
              {staff.length > 0 ? (
                <div className="space-y-2">
                  {staff.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-dark border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center text-brand text-sm font-bold">{s.name[0]}</div>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-muted">{s.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted bg-white/[0.04] px-2.5 py-0.5 rounded-full">{s.role}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{s.status}</span>
                      <button onClick={() => { setStaff(staff.map(x => x.id === s.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x)); showToast(`${s.name} ${s.status === 'Active' ? 'deactivated' : 'activated'}`); }} className="text-xs text-muted hover:text-white">{s.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </div>
                ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted border border-dashed border-white/[0.06] rounded-xl">No staff members added yet.</div>
              )}

              {showAddStaff && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddStaff(false)}>
                  <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                      <h3 className="text-lg font-semibold">Add Staff Member</h3>
                      <button onClick={() => setShowAddStaff(false)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <form onSubmit={e => { e.preventDefault(); setStaff([...staff, { id: Date.now(), name: staffForm.name, role: staffForm.role, email: staffForm.email, status: 'Active' }]); setShowAddStaff(false); showToast(`${staffForm.name} added!`); }} className="p-6 space-y-4">
                      <InputField label="Name *" value={staffForm.name} onChange={v => setStaffForm({...staffForm, name: v})} placeholder="Full name" />
                      <InputField label="Email *" value={staffForm.email} onChange={v => setStaffForm({...staffForm, email: v})} type="email" placeholder="email@gym.com" />
                      <div>
                        <label className="block text-xs text-muted mb-1.5">Role</label>
                        <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">
                          <option>Trainer</option><option>Front Desk</option><option>Manager</option><option>Admin</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddStaff(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                        <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Add Staff</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'Integrations' && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-semibold">Integrations</h3>
              {[
                { key: 'razorpay' as const, label: 'Razorpay', desc: 'Accept online payments via UPI, cards, netbanking', keyField: 'razorpayKey' as const, keyLabel: 'API Key' },
                { key: 'whatsapp' as const, label: 'WhatsApp Business', desc: 'Send automated messages & reminders', keyField: 'whatsappKey' as const, keyLabel: 'API Token' },
              ].map(int => (
                <div key={int.key} className="bg-dark border border-white/[0.06] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold">{int.label}</div>
                      <div className="text-xs text-muted">{int.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={integrations[int.key]} onChange={e => setIntegrations({...integrations, [int.key]: e.target.checked})} className="sr-only peer" />
                      <div className="w-9 h-5 bg-white/[0.08] rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  {integrations[int.key] && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <InputField label={int.keyLabel} value={integrations[int.keyField]} onChange={v => setIntegrations({...integrations, [int.keyField]: v})} placeholder={`Enter ${int.keyLabel.toLowerCase()}`} />
                      <button onClick={() => showToast(`${int.label} connected!`)} className="mt-3 text-xs bg-brand/10 text-brand hover:bg-brand/20 px-4 py-2 rounded-lg transition-all">Test Connection</button>
                    </div>
                  )}
                </div>
              ))}
              {[
                { key: 'biometric' as const, label: 'Biometric Device', desc: 'Connect fingerprint/face recognition for attendance' },
                { key: 'googleCalendar' as const, label: 'Google Calendar', desc: 'Sync class schedules with Google Calendar' },
              ].map(int => (
                <div key={int.key} className="bg-dark border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{int.label}</div>
                    <div className="text-xs text-muted">{int.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={integrations[int.key]} onChange={e => { setIntegrations({...integrations, [int.key]: e.target.checked}); showToast(`${int.label} ${e.target.checked ? 'enabled' : 'disabled'}`); }} className="sr-only peer" />
                    <div className="w-9 h-5 bg-white/[0.08] rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
              <button onClick={handleSave} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">Save Integrations</button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="space-y-5 max-w-xl">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { key: 'renewalReminder' as const, label: 'Renewal Reminders', desc: 'Auto-send reminders before plan expiry' },
                  { key: 'paymentReceipt' as const, label: 'Payment Receipts', desc: 'Send receipt after every payment' },
                  { key: 'classReminder' as const, label: 'Class Reminders', desc: 'Remind members about upcoming classes' },
                  { key: 'birthday' as const, label: 'Birthday Wishes', desc: 'Auto-send birthday greetings' },
                  { key: 'inactiveNudge' as const, label: 'Inactive Member Nudge', desc: 'Remind members who haven\'t visited recently' },
                ].map(n => (
                  <div key={n.key} className="bg-dark border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{n.label}</div>
                      <div className="text-xs text-muted">{n.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifs[n.key]} onChange={e => setNotifs({...notifs, [n.key]: e.target.checked})} className="sr-only peer" />
                      <div className="w-9 h-5 bg-white/[0.08] rounded-full peer peer-checked:bg-brand transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Renewal reminder (days before)" value={notifs.renewDaysBefore} onChange={v => setNotifs({...notifs, renewDaysBefore: v})} type="number" />
                <div>
                  <label className="block text-xs text-muted mb-1.5">Default send time</label>
                  <input type="time" value={notifs.reminderTime} onChange={e => setNotifs({...notifs, reminderTime: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" />
                </div>
              </div>
              <button onClick={handleSave} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all">Save Preferences</button>
            </div>
          )}

          {/* Billing */}
          {activeTab === 'Billing' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="text-lg font-semibold">Billing & Subscription</h3>
              <div className="bg-dark border border-brand/20 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-brand bg-brand/10 px-2.5 py-0.5 rounded-full font-medium">Current Plan</span>
                    <h4 className="text-xl font-bold mt-2">{billing.plan} — {billing.amount}/mo</h4>
                  </div>
                  <button onClick={() => showToast('Plan upgrade coming soon!')} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all">Upgrade</button>
                </div>
                <div className="flex gap-6 text-xs text-muted mt-3 pt-3 border-t border-white/[0.06]">
                  <span>Cycle: {billing.billingCycle}</span>
                  <span>Next billing: {billing.nextBilling}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Payment History</h4>
                <div className="space-y-2">
                  {[
                    { date: 'Mar 1, 2026', amount: '₹3,999', status: 'Paid', invoice: '#INV-2026-03' },
                    { date: 'Feb 1, 2026', amount: '₹3,999', status: 'Paid', invoice: '#INV-2026-02' },
                    { date: 'Jan 1, 2026', amount: '₹3,999', status: 'Paid', invoice: '#INV-2026-01' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 bg-dark border border-white/[0.06] rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">{p.date}</span>
                        <span className="text-sm font-medium">{p.amount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-green-500/10 text-green-400 px-2.5 py-0.5 rounded-full">{p.status}</span>
                        <button onClick={() => showToast(`Downloading ${p.invoice}...`)} className="text-xs text-brand hover:underline">Invoice</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.06]">
                <button onClick={() => showToast('Account deletion request submitted. We\'ll contact you within 24 hours.')} className="text-xs text-red-400 hover:text-red-300">Delete Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
