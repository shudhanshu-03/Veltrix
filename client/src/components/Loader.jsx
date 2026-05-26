export function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
      <div className="w-10 h-10 border-2 border-white/10 border-t-brand-purple rounded-full animate-spin" />
      <p className="text-sm">Loading...</p>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid-games">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="skeleton h-44 w-full" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3 w-3/5 rounded" />
      </div>
    </div>
  );
}
