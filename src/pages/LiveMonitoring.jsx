import { useMemo } from 'react';
import { Radio, Wifi, WifiOff, Activity } from 'lucide-react';
import { useLiveMonitoring } from '../hooks/useLiveMonitoring';
import DeviceSummaryCard from '../components/LiveMonitoring/DeviceSummaryCard';
import LiveMap from '../components/LiveMonitoring/LiveMap';
import LiveFeed from '../components/LiveMonitoring/LiveFeed';
import SensorTable from '../components/LiveMonitoring/SensorTable';
import DeviceStatusCard from '../components/LiveMonitoring/DeviceStatusCard';
import ConnectionErrorCard from '../components/LiveMonitoring/ConnectionErrorCard';
import {
  SummaryCardsSkeleton,
  MapFeedSkeleton,
  TableSkeleton,
  DevicesSkeleton,
} from '../components/LiveMonitoring/LoadingSkeleton';

const SUMMARY_CARDS = [
  {
    key: 'connectedDevices',
    label: 'Connected Devices',
    icon: Radio,
    accent: '#2563EB',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
  },
  {
    key: 'onlineDevices',
    label: 'Online Devices',
    icon: Wifi,
    accent: '#16A34A',
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
  },
  {
    key: 'offlineDevices',
    label: 'Offline Devices',
    icon: WifiOff,
    accent: '#64748B',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
  {
    key: 'todaysDetections',
    label: "Today's Detections",
    icon: Activity,
    accent: '#F59E0B',
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#F59E0B]',
  },
];

export default function LiveMonitoring() {
  const { reports, devices, summary, loading, error, retry } = useLiveMonitoring();

  const feedEvents = useMemo(() => reports.slice(0, 20), [reports]);

  const sortedDevices = useMemo(
    () =>
      [...devices].sort((a, b) => {
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        return new Date(b.lastCommunication).getTime() - new Date(a.lastCommunication).getTime();
      }),
    [devices]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SummaryCardsSkeleton />
        <MapFeedSkeleton />
        <TableSkeleton />
        <DevicesSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ConnectionErrorCard message={error.message} onRetry={retry} />
      </div>
    );
  }

  const hasData = devices.length > 0 || reports.length > 0;

  return (
    <div className="space-y-6">
      {/* Section 1 — Device Summary */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {SUMMARY_CARDS.map((card) => (
            <DeviceSummaryCard
              key={card.key}
              label={card.label}
              value={summary[card.key]}
              icon={card.icon}
              accent={card.accent}
              iconBg={card.iconBg}
              iconColor={card.iconColor}
            />
          ))}
        </div>
      </section>

      {/* Section 2 & 3 — Live Map + Event Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 min-h-[480px] lg:min-h-[520px]">
        <div className="lg:col-span-7 h-[400px] lg:h-full min-h-0">
          <LiveMap reports={reports} />
        </div>
        <div className="lg:col-span-3 h-[400px] lg:h-full min-h-0">
          <LiveFeed events={feedEvents} />
        </div>
      </section>

      {/* Section 4 — Real-Time Sensor Stream */}
      <section>
        <SensorTable reports={reports} />
      </section>

      {/* Section 5 — Connected Devices */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#334155]">Connected Devices</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {devices.length} registered device{devices.length !== 1 ? 's' : ''} — online if data received within 2 minutes
          </p>
        </div>

        {!hasData ? (
          <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow p-12 text-center">
            <p className="text-sm text-slate-400 font-medium">
              No active IoT devices currently transmitting.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedDevices.map((device) => (
              <DeviceStatusCard key={device.deviceId} device={device} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
