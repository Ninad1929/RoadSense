import { Download } from 'lucide-react';

const conditionBadge = {
  Poor: 'bg-red-50 text-red-600 border border-red-100',
  Moderate: 'bg-amber-50 text-amber-600 border border-amber-100',
  Good: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

export default function ReportsTable({ reports }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 card-shadow p-6 overflow-hidden">
      {/* Title */}
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
        Recent Road Reports
      </h3>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Road Name</th>
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Condition</th>
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confidence</th>
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
              <th className="pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-slate-50/50 transition-colors odd:bg-white even:bg-slate-50/30"
              >
                <td className="py-4 text-xs font-semibold text-slate-800">{report.roadName}</td>
                <td className="py-4 text-xs text-slate-500 font-mono">
                  {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </td>
                <td className="py-4">
                  <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${conditionBadge[report.condition]}`}>
                    {report.condition}
                  </span>
                </td>
                <td className="py-4 text-xs font-bold text-slate-700 font-mono">
                  {report.confidence}%
                </td>
                <td className="py-4 text-xs font-semibold text-slate-500">
                  {report.timestamp}
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
