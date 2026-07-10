import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartCard = ({ icon: Icon, title, subtitle, children, iconColor = 'text-blue-400', iconBg = 'bg-blue-500/10' }) => (
  <div className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/50">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function AnalyticsCharts({ analytics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Pie Chart - Road Condition Distribution */}
      <ChartCard
        icon={PieIcon}
        title="Condition Distribution"
        subtitle="Overall road health breakdown"
        iconColor="text-purple-400"
        iconBg="bg-purple-500/10"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.conditionDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {analytics.conditionDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-xl">
                        <p className="text-sm font-semibold" style={{ color: data.payload.fill }}>
                          {data.name}
                        </p>
                        <p className="text-xs text-slate-400">{data.value.toLocaleString()} roads</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-2">
          {analytics.conditionDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-xs text-slate-400">{item.name}</span>
              <span className="text-xs font-semibold text-slate-300">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Bar Chart - Daily Reports */}
      <ChartCard
        icon={BarChart3}
        title="Daily Reports"
        subtitle="Reports by day of week"
        iconColor="text-cyan-400"
        iconBg="bg-cyan-500/10"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dailyReports} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="poor" name="Poor" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="moderate" name="Moderate" fill="#eab308" radius={[2, 2, 0, 0]} />
              <Bar dataKey="good" name="Good" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Area Chart - Reports Over Time */}
      <ChartCard
        icon={TrendingUp}
        title="Reports Over Time"
        subtitle="Monthly trend analysis"
        iconColor="text-blue-400"
        iconBg="bg-blue-500/10"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.reportsOverTime}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="reports"
                name="Reports"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorReports)"
                dot={{ r: 4, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
