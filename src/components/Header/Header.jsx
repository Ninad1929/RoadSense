import { useState, useEffect } from 'react';
import { Bell, Calendar, User, ChevronDown, Menu } from 'lucide-react';

export default function Header({ onMenuToggle }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute is enough since we only show minutes
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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side: Hamburger menu & Section title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-blue-600 tracking-wide">Dashboard</h2>
        </div>

        {/* Right Side: Date/Time, Alerts, Profile */}
        <div className="flex items-center gap-6">
          {/* Date & Time */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">{formatDateTime(currentTime)}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl border border-slate-200/60 bg-slate-50 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 transition-all duration-150 group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-md shadow-red-500/20">
              3
            </span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all duration-150 group">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-tight">Admin</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
