import { memo } from 'react';

const conditionStyles = {
  Good: 'bg-green-50 text-[#16A34A] border-green-100',
  Moderate: 'bg-amber-50 text-[#F59E0B] border-amber-100',
  Poor: 'bg-red-50 text-[#DC2626] border-red-100',
};

const onlineStyles = {
  online: 'bg-green-50 text-[#16A34A] border-green-100',
  offline: 'bg-slate-100 text-slate-500 border-slate-200',
};

function StatusBadge({ type = 'condition', value, label }) {
  const style =
    type === 'online'
      ? onlineStyles[value] ?? onlineStyles.offline
      : conditionStyles[value] ?? conditionStyles.Moderate;

  const display = label ?? value;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wide ${style}`}
    >
      {display}
    </span>
  );
}

export default memo(StatusBadge);
