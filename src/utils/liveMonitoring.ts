import { DeviceInfo } from '../types/DeviceInfo';
import { RoadReport, LiveMonitoringSummary } from '../types/RoadReport';
import { ONLINE_THRESHOLD_MS } from '../services/roadReportService';
import { getReportTimestampMs } from './roadReport';

export function isDeviceOnline(timestamp: string, now = Date.now()): boolean {
  return now - getReportTimestampMs(timestamp) <= ONLINE_THRESHOLD_MS;
}

export function formatSensorValue(value: RoadReport['accelerometer']): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  return `${value.x.toFixed(2)}, ${value.y.toFixed(2)}, ${value.z.toFixed(2)}`;
}

export function getLatestReportPerDevice(reports: RoadReport[]): RoadReport[] {
  const deviceMap = new Map<string, RoadReport>();

  for (const report of reports) {
    if (!report.deviceId) continue;
    const existing = deviceMap.get(report.deviceId);
    if (!existing || getReportTimestampMs(report.timestamp) > getReportTimestampMs(existing.timestamp)) {
      deviceMap.set(report.deviceId, report);
    }
  }

  return Array.from(deviceMap.values());
}

export function aggregateDevices(reports: RoadReport[], now = Date.now()): DeviceInfo[] {
  const latestReports = getLatestReportPerDevice(reports);

  return latestReports
    .map((report) => ({
      deviceId: report.deviceId,
      isOnline: isDeviceOnline(report.timestamp, now),
      lastCommunication: report.timestamp,
      latestCondition: report.condition,
      latitude: report.latitude,
      longitude: report.longitude,
      battery: report.battery,
      latestReportId: report.id,
    }))
    .sort((a, b) => a.deviceId.localeCompare(b.deviceId));
}

export function computeSummary(
  reports: RoadReport[],
  devices: DeviceInfo[]
): LiveMonitoringSummary {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysDetections = reports.filter(
    (r) => getReportTimestampMs(r.timestamp) >= todayStart.getTime()
  ).length;

  const onlineDevices = devices.filter((d) => d.isOnline).length;

  return {
    connectedDevices: devices.length,
    onlineDevices,
    offlineDevices: devices.length - onlineDevices,
    todaysDetections,
  };
}

export function sortReportsNewestFirst(reports: RoadReport[]): RoadReport[] {
  return [...reports].sort(
    (a, b) => getReportTimestampMs(b.timestamp) - getReportTimestampMs(a.timestamp)
  );
}
