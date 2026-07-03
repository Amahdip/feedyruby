export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-hidden>
      <div className="h-7 w-40 rounded bg-slate-200" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-slate-200" />
    </div>
  );
}
