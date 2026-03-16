export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-surface-2 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="h-28 rounded-2xl bg-surface border border-white/[0.06]" />
        <div className="h-28 rounded-2xl bg-surface border border-white/[0.06]" />
        <div className="h-28 rounded-2xl bg-surface border border-white/[0.06]" />
        <div className="h-28 rounded-2xl bg-surface border border-white/[0.06]" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-surface border border-white/[0.06]" />
        <div className="h-72 rounded-2xl bg-surface border border-white/[0.06]" />
      </div>
    </div>
  );
}
