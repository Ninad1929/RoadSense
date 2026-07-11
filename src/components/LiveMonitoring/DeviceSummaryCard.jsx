import { memo } from 'react';

function DeviceSummaryCard({ label, value, icon: Icon, accent, iconBg, iconColor }) {
  return (
    <div className="card-shadow bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4 h-[96px]">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0`}
        style={{ borderColor: `${accent}20` }}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold tracking-tight leading-none mt-1.5" style={{ color: accent }}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default memo(DeviceSummaryCard);
