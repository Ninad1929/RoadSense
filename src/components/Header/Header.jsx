import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Calendar, User, ChevronDown, Menu } from 'lucide-react';
import { getPageMeta } from '../../config/navigation';

export default function Header({ onMenuToggle }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { pathname } = useLocation();
  const { title, subtitle } = getPageMeta(pathname);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${formattedDate}  •  ${formattedTime}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between px-6 h-[64px]">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-xl text-[#334155] hover:text-slate-900 hover:bg-[#F8FAFC] transition-all duration-200 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#334155] leading-tight">{title}</h2>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-sm font-medium text-[#334155] whitespace-nowrap">
              {formatDateTime(currentTime)}
            </span>
          </div>

          <button className="relative p-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white text-[#334155] transition-all duration-200">
            <Bell className="w-[18px] h-[18px] text-slate-500" />
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#DC2626] rounded-full text-[10px] font-semibold flex items-center justify-center text-white">
              3
            </span>
          </button>

          <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F8FAFC] transition-all duration-200">
            <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#334155] leading-tight">Admin</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
