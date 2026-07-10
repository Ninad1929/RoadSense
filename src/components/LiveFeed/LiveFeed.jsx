const conditionBadgeStyles = {
  Poor: 'bg-red-50 text-red-600 border border-red-100',
  Moderate: 'bg-amber-50 text-amber-600 border border-amber-100',
  Good: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

const bulletColors = {
  Poor: 'bg-red-500',
  Moderate: 'bg-amber-500',
  Good: 'bg-emerald-500',
};

export default function LiveFeed({ feedData }) {
  // Sort by timestamp descending and keep only the latest 5 reports
  const latestFeed = [...feedData]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="rounded-xl bg-white border border-slate-200 card-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Feed</h3>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View All
        </button>
      </div>

      {/* Feed Items */}
      <div className="flex-1 px-4 py-1 divide-y divide-slate-100 overflow-hidden">
        {latestFeed.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-3.5 animate-fade-in"
          >
            {/* Left side: status bullet and time/location */}
            <div className="flex items-start gap-2.5 min-w-0">
              <div className={`w-2 h-2 rounded-full ${bulletColors[item.condition]} mt-1.5 flex-shrink-0`} />
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-slate-800 block leading-tight">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[12px] text-slate-500 block leading-tight truncate mt-0.5 font-medium">
                  {item.roadName}
                </span>
              </div>
            </div>

            {/* Right side: condition badge */}
            <div className="flex-shrink-0 ml-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${conditionBadgeStyles[item.condition]}`}>
                {item.condition}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
