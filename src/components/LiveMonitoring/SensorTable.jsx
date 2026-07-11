import { memo } from 'react';
import { formatSensorValue } from '../../utils/liveMonitoring';
import { formatReportTimestamp } from '../../utils/roadReport';
import StatusBadge from './StatusBadge';

function SensorTable({ reports }) {
  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E2E8F0]">
        <h3 className="text-sm font-semibold text-[#334155]">Real-Time Sensor Stream</h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Live telemetry from connected IoT devices — newest first
        </p>
      </div>

      <div className="overflow-auto max-h-[420px]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
            <tr className="border-b border-[#E2E8F0]">
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Timestamp
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Device ID
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Latitude
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Longitude
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Accelerometer
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Gyroscope
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Road Condition
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Speed
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                  No active IoT devices currently transmitting.
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr
                  key={report.id}
                  className={`border-b border-[#E2E8F0] last:border-b-0 hover:bg-blue-50/40 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]/60'
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-medium">
                    {formatReportTimestamp(report.timestamp, {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#334155] font-mono whitespace-nowrap">
                    {report.deviceId}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {report.latitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {report.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {formatSensorValue(report.accelerometer)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {formatSensorValue(report.gyroscope)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge type="condition" value={report.condition} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {report.speed != null ? `${report.speed.toFixed(1)} km/h` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(SensorTable);
