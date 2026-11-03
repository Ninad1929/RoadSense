import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { formatReportTimestamp } from '../../utils/roadReport';
import { sortReportsNewestFirst } from '../../utils/liveMonitoring';
import { downloadReports } from '../../utils/exportReports';

const conditionBadge = {
  Poor: 'bg-red-50 text-[#DC2626] border-red-100',
  Moderate: 'bg-amber-50 text-[#F59E0B] border-amber-100',
  Good: 'bg-green-50 text-[#16A34A] border-green-100',
};

export default function ReportsTable({ reports }) {
  const [showAll, setShowAll] = useState(false);
  const sortedReports = useMemo(() => sortReportsNewestFirst(reports), [reports]);
  const visibleReports = showAll ? sortedReports : sortedReports.slice(0, 30);

  return (
    <div className="rounded-xl bg-white border border-[#E2E8F0] card-shadow overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-sm font-semibold text-[#334155]">Latest Road Reports</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {reports.length} total report{reports.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadReports(sortedReports)}
          disabled={reports.length === 0}
          title="Download all readings as an Excel workbook"
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download sheet
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
            <tr className="border-b border-[#E2E8F0]">
              <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Road Name
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Longitude
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleReports.map((report, index) => (
              <tr
                key={report.id}
                className={`border-b border-[#E2E8F0] last:border-b-0
                  hover:bg-blue-50/40 transition-colors duration-200
                  ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]/60'}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-[#334155] whitespace-nowrap">
                  {report.roadName}
                </td>
                <td className="px-4 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">
                  {report.latitude.toFixed(4)}
                </td>
                <td className="px-4 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">
                  {report.longitude.toFixed(4)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold border uppercase tracking-wide ${conditionBadge[report.condition]}`}
                  >
                    {report.condition}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {formatReportTimestamp(report.timestamp)}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button type="button" onClick={() => downloadReports([report])} aria-label={`Download reading for ${report.roadName || 'Unknown Road'}`} className="p-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-slate-400 hover:text-[#334155] transition-all duration-200 inline-flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No readings recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]/50">
        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="text-[#334155] font-semibold">{visibleReports.length}</span> of{' '}
          <span className="text-[#334155] font-semibold">{reports.length}</span> reports
        </p>
        {reports.length > 30 && (
          <button
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-expanded={showAll}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
          >
            {showAll ? 'Show less' : `Show more (${reports.length - 30} older readings)`}
          </button>
        )}
      </div>
    </div>
  );
}
