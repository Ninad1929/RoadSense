import { memo } from 'react';
import {
  AlertTriangle,
  MinusCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Cpu,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatReportTimestamp } from '../../utils/roadReport';

const conditionConfig = {
  Poor: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-[#DC2626]',
  },
  Moderate: {
    icon: MinusCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#F59E0B]',
  },
  Good: {
    icon: CheckCircle2,
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
  },
};

function LiveFeed({ events }) {
  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] pulse-dot" />
          <h3 className="text-sm font-semibold text-[#334155]">Live Event Feed</h3>
        </div>
        <span className="text-xs font-medium text-slate-400">{events.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full px-5">
            <p className="text-sm text-slate-400 font-medium text-center">
              No active IoT devices currently transmitting.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E2E8F0]">
            {events.map((event) => {
              const config = conditionConfig[event.condition] || conditionConfig.Good;
              const StatusIcon = config.icon;

              return (
                <li
                  key={event.id}
                  className="px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Cpu className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-[#334155] font-mono truncate">
                            {event.deviceId}
                          </span>
                        </div>
                        <StatusBadge type="condition" value={event.condition} />
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500 font-mono truncate">
                          {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-400 font-medium">
                            {formatReportTimestamp(event.timestamp, {
                              dateStyle: 'short',
                              timeStyle: 'medium',
                            })}
                          </span>
                        </div>
                        {event.confidence > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            {event.confidence.toFixed(1)}% conf.
                          </span>
                        )}
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

export default memo(LiveFeed);
