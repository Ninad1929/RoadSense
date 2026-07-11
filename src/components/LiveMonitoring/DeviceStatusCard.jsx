import { memo } from 'react';
import { MapPin, Clock, Battery, Radio } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatReportTimestamp } from '../../utils/roadReport';

function DeviceStatusCard({ device }) {
  const statusKey = device.isOnline ? 'online' : 'offline';
  const statusLabel = device.isOnline ? 'Online' : 'Offline';
  const borderColor = device.isOnline ? 'border-green-200' : 'border-[#E2E8F0]';

  return (
    <div className={`rounded-xl bg-white border ${borderColor} card-shadow p-5 transition-colors duration-200`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              device.isOnline ? 'bg-green-50' : 'bg-slate-100'
            }`}
          >
            <Radio className={`w-4 h-4 ${device.isOnline ? 'text-[#16A34A]' : 'text-slate-400'}`} />
          </div>
          <p className="text-sm font-semibold text-[#334155] font-mono truncate">{device.deviceId}</p>
        </div>
        <StatusBadge type="online" value={statusKey} label={statusLabel} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Road Status</span>
          <StatusBadge type="condition" value={device.latestCondition} />
        </div>

        {device.battery != null && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Battery className="w-3 h-3" /> Battery
            </span>
            <span className="text-xs font-semibold text-[#334155]">{device.battery}%</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" /> Last Seen
          </span>
          <span className="text-xs text-slate-500 font-medium text-right">
            {formatReportTimestamp(device.lastCommunication)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 pt-1 border-t border-[#E2E8F0]">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
            <MapPin className="w-3 h-3" /> GPS
          </span>
          <span className="text-xs text-slate-500 font-mono text-right">
            {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(DeviceStatusCard);
