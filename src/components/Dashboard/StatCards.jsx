import {
  AlertTriangle,
  MinusCircle,
  CheckCircle2,
  Radio,
} from 'lucide-react';

const cardConfig = [
  {
    key: 'poorRoads',
    label: 'Poor Roads',
    icon: AlertTriangle,
    accent: '#DC2626',
    iconBg: 'bg-red-50',
    iconColor: 'text-[#DC2626]',
    borderColor: 'border-red-100',
  },
  {
    key: 'moderateRoads',
    label: 'Moderate Roads',
    icon: MinusCircle,
    accent: '#F59E0B',
    iconBg: 'bg-amber-50',
    iconColor: 'text-[#F59E0B]',
    borderColor: 'border-amber-100',
  },
  {
    key: 'goodRoads',
    label: 'Good Roads',
    icon: CheckCircle2,
    accent: '#16A34A',
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
    borderColor: 'border-green-100',
  },
  {
    key: 'activeDevices',
    label: 'Active Devices',
    icon: Radio,
    accent: '#2563EB',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
    borderColor: 'border-blue-100',
  },
];

export default function StatCards({ statistics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const value = statistics[card.key];

        return (
          <div
            key={card.key}
            className="card-shadow bg-white border border-[#E2E8F0] rounded-xl p-6
              flex items-center gap-4 h-[108px] hover:shadow-md transition-all duration-200 animate-fade-in"
          >
            <div
              className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.borderColor} border
                flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {card.label}
              </p>
              <p
                className="text-3xl font-semibold tracking-tight leading-none mt-1.5"
                style={{ color: card.accent }}
              >
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
