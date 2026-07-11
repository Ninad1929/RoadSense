import { RoadReport } from '../types/RoadReport';

export function toReportDate(timestamp: RoadReport['timestamp'] | unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date(timestamp as string);
}

export function formatReportTimestamp(
  timestamp: RoadReport['timestamp'] | unknown,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }
): string {
  return toReportDate(timestamp).toLocaleString([], options);
}

export function getReportTimestampMs(timestamp: RoadReport['timestamp'] | unknown): number {
  return toReportDate(timestamp).getTime();
}
