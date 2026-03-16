'use client';
import { useState } from 'react';

interface ClassItem {
  id: number; name: string; type: string; trainer: string; room: string; day: number; startHour: number; duration: number; maxCapacity: number; booked: number; status: string;
}

const types = ['Yoga', 'Zumba', 'HIIT', 'CrossFit', 'Pilates', 'Spinning', 'Boxing', 'Strength'];
const trainers = ['Deepak', 'Suman', 'Ravi', 'Pooja', 'Vikash'];
const rooms = ['Studio A', 'Studio B', 'Main Floor', 'Rooftop'];
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 14 }, (_, i) => i + 6);

const initialClasses: ClassItem[] = [];

const typeColors: Record<string, string> = {
  Yoga: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Zumba: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  HIIT: 'bg-red-500/20 text-red-400 border-red-500/30',
  CrossFit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Pilates: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Spinning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Boxing: 'bg-red-600/20 text-red-300 border-red-600/30',
  Strength: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const emptyForm = { name: '', type: 'Yoga', trainer: '', room: '', day: 0, startHour: 8, duration: 1, maxCapacity: 20 };

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<ClassItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: ClassItem = { id: Date.now(), name: form.name, type: form.type, trainer: form.trainer, room: form.room, day: Number(form.day), startHour: Number(form.startHour), duration: Number(form.duration), maxCapacity: Number(form.maxCapacity), booked: 0, status: 'scheduled' };
    setClasses([...classes, newClass]);
    setShowCreate(false);
    setForm(emptyForm);
    showToast(`Class "${form.name}" created!`);
  };

  const cancelClass = (cls: ClassItem) => {
    setClasses(classes.map(c => c.id === cls.id ? { ...c, status: 'cancelled' } : c));
    setShowDetail(null);
    showToast(`Class "${cls.name}" cancelled.`);
  };

  const getClassAt = (day: number, hour: number) => classes.filter(c => c.day === day && c.startHour === hour && c.status === 'scheduled');

  return (
    <div className="animate-fade-in">
      {toast && <div className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm animate-slide-down shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Class Schedule</h2>
          <p className="text-sm text-muted mt-1">{classes.filter(c=>c.status==='scheduled').length} classes this week · {classes.reduce((s,c)=>s+c.booked,0)} total bookings</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setShowCreate(true); }} className="bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Class
        </button>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-surface border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-white/[0.06]">
              <div className="px-4 py-3 text-xs text-muted font-medium">Time</div>
              {dayNames.map(d => <div key={d} className="px-4 py-3 text-xs text-muted font-medium text-center">{d}</div>)}
            </div>
            {/* Time slots */}
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-white/[0.03] min-h-[60px]">
                <div className="px-4 py-2 text-xs text-muted border-r border-white/[0.04] flex items-start pt-3">
                  {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                </div>
                {dayNames.map((_, dayIdx) => {
                  const cellClasses = getClassAt(dayIdx, hour);
                  return (
                    <div key={dayIdx} className="px-1 py-1 border-r border-white/[0.03] last:border-0 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => { if (cellClasses.length === 0) { setForm({ ...emptyForm, day: dayIdx, startHour: hour }); setShowCreate(true); } }}>
                      {cellClasses.map(cls => (
                        <button key={cls.id} onClick={(e) => { e.stopPropagation(); setShowDetail(cls); }} className={`w-full text-left px-2 py-1.5 rounded-lg border text-xs mb-1 ${typeColors[cls.type] || 'bg-white/5 text-white border-white/10'}`}>
                          <div className="font-medium truncate">{cls.name}</div>
                          <div className="opacity-70 text-[10px]">{cls.trainer} · {cls.booked}/{cls.maxCapacity}</div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold">Create Class</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="block text-xs text-muted mb-1.5">Class Name *</label><input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" placeholder="e.g. Morning Yoga" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">{types.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs text-muted mb-1.5">Trainer</label><select value={form.trainer} onChange={e => setForm({...form, trainer: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value="">Select</option>{trainers.map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Day</label><select value={form.day} onChange={e => setForm({...form, day: Number(e.target.value)})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">{dayNames.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></div>
                <div><label className="block text-xs text-muted mb-1.5">Start Time</label><select value={form.startHour} onChange={e => setForm({...form, startHour: Number(e.target.value)})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand">{hours.map(h=><option key={h} value={h}>{h > 12 ? h-12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs text-muted mb-1.5">Room</label><select value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value="">Select</option>{rooms.map(r=><option key={r}>{r}</option>)}</select></div>
                <div><label className="block text-xs text-muted mb-1.5">Duration (h)</label><select value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"><option value={0.5}>30 min</option><option value={0.75}>45 min</option><option value={1}>1 hour</option><option value={1.5}>1.5 hours</option></select></div>
                <div><label className="block text-xs text-muted mb-1.5">Capacity</label><input type="number" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity: Number(e.target.value)})} className="w-full bg-dark border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-brand hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-medium transition-all">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-surface border border-white/[0.08] rounded-2xl w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 border ${typeColors[showDetail.type]}`}>{showDetail.type}</div>
              <h3 className="text-xl font-bold mb-1">{showDetail.name}</h3>
              <p className="text-sm text-muted mb-4">{dayNames[showDetail.day]} at {showDetail.startHour > 12 ? showDetail.startHour - 12 : showDetail.startHour}:00 {showDetail.startHour >= 12 ? 'PM' : 'AM'}</p>
              <div className="space-y-3 mb-6">
                {[
                  { l: 'Trainer', v: showDetail.trainer },
                  { l: 'Room', v: showDetail.room },
                  { l: 'Duration', v: `${showDetail.duration}h` },
                  { l: 'Bookings', v: `${showDetail.booked} / ${showDetail.maxCapacity}` },
                  { l: 'Status', v: showDetail.status },
                ].map(i => (
                  <div key={i.l} className="flex justify-between text-sm">
                    <span className="text-muted">{i.l}</span>
                    <span className={`${i.l === 'Status' && i.v === 'cancelled' ? 'text-red-400' : 'text-white/90'} capitalize`}>{i.v}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2 mb-1">
                <div className="bg-brand rounded-full h-2 transition-all" style={{ width: `${(showDetail.booked / showDetail.maxCapacity) * 100}%` }} />
              </div>
              <p className="text-xs text-muted mb-6">{showDetail.maxCapacity - showDetail.booked} spots remaining</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDetail(null)} className="flex-1 border border-white/[0.08] hover:bg-white/[0.03] text-white py-2.5 rounded-xl text-sm font-medium transition-all">Close</button>
                {showDetail.status === 'scheduled' && (
                  <button onClick={() => cancelClass(showDetail)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-sm font-medium transition-all">Cancel Class</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
