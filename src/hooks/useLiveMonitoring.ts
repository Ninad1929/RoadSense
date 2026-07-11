import { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeToRoadReports, MAX_LIVE_RECORDS } from '../services/roadReportService';
import { aggregateDevices, computeSummary, sortReportsNewestFirst } from '../utils/liveMonitoring';
import { RoadReport } from '../types/RoadReport';
import { DeviceInfo } from '../types/DeviceInfo';
import { LiveMonitoringSummary } from '../types/RoadReport';

const STATUS_REFRESH_MS = 30_000;

interface UseLiveMonitoringResult {
  reports: RoadReport[];
  devices: DeviceInfo[];
  summary: LiveMonitoringSummary;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useLiveMonitoring(): UseLiveMonitoringResult {
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [statusTick, setStatusTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStatusTick((t) => t + 1), STATUS_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToRoadReports(
      (data) => {
        if (!isMounted) return;
        setReports(sortReportsNewestFirst(data).slice(0, MAX_LIVE_RECORDS));
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (!isMounted) return;
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [retryKey]);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  const now = useMemo(() => Date.now(), [reports, statusTick]);

  const devices = useMemo(
    () => aggregateDevices(reports, now),
    [reports, now]
  );

  const summary = useMemo(
    () => computeSummary(reports, devices),
    [reports, devices]
  );

  return { reports, devices, summary, loading, error, retry };
}
