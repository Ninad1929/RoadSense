import {
  FileText,
  Clock,
  MinusCircle,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

const cardConfig = [
  {
    key: 'totalReports',
    label: 'Total Reports',
    icon: FileText,
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/50',
    trendColor: 'text-blue-600 bg-blue-50/70 border border-blue-100/40',
  },
  {
    key: 'poorRoads',
    label: 'Poor Roads',
    icon: Clock,
    iconBg: 'bg-red-50 text-red-600 border border-red-100/50',
    trendColor: 'text-red-600 bg-red-50/70 border border-red-100/40',
  },
  {
    key: 'moderateRoads',
    label: 'Moderate Roads',
    icon: MinusCircle,
    iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    trendColor: 'text-amber-600 bg-amber-50/70 border border-amber-100/40',
  },
  {
    key: 'goodRoads',
    label: 'Good Roads',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    trendColor: 'text-emerald-600 bg-emerald-50/70 border border-emerald-100/40',
  },
  {
    key: 'activeDevices',
    label: 'Active Devices',
    icon: Smartphone,
    iconBg: 'bg-indigo-50 text-indigo-500 border border-indigo-100/50',
    trendColor: 'text-blue-600 bg-blue-50/70 border border-blue-100/40',
  },
];

export default function StatCards({ statistics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = statistics[card.key];
        const change = statistics.changes[card.key];
        const isPositive = change >= 0;
        const isLastCard = card.key === 'activeDevices';

        return (
          <div
            key={card.key}
            className={`card-shadow flex items-center gap-4 rounded-xl bg-white border border-slate-200
              p-4 h-full animate-fade-in
              ${isLastCard ? 'col-span-2 md:col-span-1' : ''} group cursor-pointer`}
          >
            {/* Icon Box */}
            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Info Column */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">
                {card.label}
              </p>
              <p className="text-xl font-extrabold text-slate-800 tracking-tight leading-none mt-1">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
