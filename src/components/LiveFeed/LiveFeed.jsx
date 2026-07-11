import {
  AlertTriangle,
  MinusCircle,
  CheckCircle2,
  MapPin,
  Clock,
} from 'lucide-react';
import { formatReportTimestamp, getReportTimestampMs } from '../../utils/roadReport';

const conditionConfig = {
  Poor: {
    badge: 'bg-red-50 text-[#DC2626] border-red-100',
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-[#DC2626]',
    dot: 'bg-[#DC2626]',
  },
  Moderate: {
    badge: 'bg-amber-50 text-[#F59E0B] border-amber-100',
    icon: MinusCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  Good: {
    badge: 'bg-green-50 text-[#16A34A] border-green-100',
    icon: CheckCircle2,
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
    dot: 'bg-[#16A34A]',
  },
};

export default function LiveFeed({ feedData }) {
  const latestFeed = [...feedData]
    .sort((a, b) => getReportTimestampMs(b.timestamp) - getReportTimestampMs(a.timestamp))
    .slice(0, 8);

  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] pulse-dot" />
          <h3 className="text-sm font-semibold text-[#334155]">Live Feed</h3>
        </div>
        <button className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-200">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {latestFeed.length === 0 ? (
          <div className="flex items-center justify-center h-full px-5">
            <p className="text-sm text-slate-400 font-medium">No live events yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E2E8F0]">
            {latestFeed.map((item) => {
              const config = conditionConfig[item.condition] || conditionConfig.Good;
              const StatusIcon = config.icon;

              return (
                <li
                  key={item.id}
                  className="px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors duration-200 animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#334155] truncate">
                          {item.roadName}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wide flex-shrink-0 ${config.badge}`}
                        >
                          {item.condition}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 font-mono truncate">
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400 font-medium">
                          {formatReportTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
