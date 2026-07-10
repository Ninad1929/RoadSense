import { AlertTriangle, AlertCircle, Info, Clock, ShieldAlert } from 'lucide-react';

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-red-500/5',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/30',
    label: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    label: 'Info',
  },
};

export default function AlertsSection({ alerts }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
            <p className="text-xs text-slate-500">{alerts.length} active notifications</p>
          </div>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
          View All
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`animate-fade-in-up opacity-0 p-4 rounded-xl border ${config.border} ${config.bg}
                hover:bg-opacity-10 transition-all duration-200 cursor-pointer group`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${config.iconBg}`}>
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-600">{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
