export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-[#E2E8F0] p-5 h-[96px] animate-pulse flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-[480px] lg:min-h-[520px]">
      <div className="lg:col-span-7 h-[400px] lg:h-full rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />
      <div className="lg:col-span-3 h-[400px] lg:h-full rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E2E8F0]">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function DevicesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-[#E2E8F0] p-5 h-[180px] animate-pulse"
        />
      ))}
    </div>
  );
}
