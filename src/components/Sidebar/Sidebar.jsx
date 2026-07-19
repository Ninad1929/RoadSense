import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi,
} from 'lucide-react';
import { navItems } from '../../config/navigation';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const showLabels = !isCollapsed || isMobileOpen;

  return (
    <aside
      className={`flex-shrink-0 h-screen z-50 flex flex-col bg-[#1E293B]
        transition-all duration-200 ease-in-out
        fixed lg:static inset-y-0 left-0
        ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[250px]'} w-[250px]
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-slate-700/60 ${showLabels ? 'gap-3 px-5 py-5' : 'justify-center px-3 py-5'}`}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {showLabels && (
          <div className="overflow-hidden min-w-0">
            <h1 className="text-[15px] font-semibold text-white tracking-wide leading-tight">
              RoadSense
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
              Road Monitoring
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) =>
                `relative w-full flex items-center rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${showLabels ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5'}
                ${isActive
                  ? 'bg-[#2563EB]/15 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2563EB] rounded-r-full" />
                  )}
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-[#60A5FA]' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {showLabels && (
                    <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Active Devices */}
      {showLabels && (
        <div className="mx-3 mb-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-700/80 flex items-center justify-center flex-shrink-0">
              <Wifi className="w-[18px] h-[18px] text-[#60A5FA]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                Active Devices
              </span>
              <span className="text-lg font-semibold text-white leading-tight block mt-0.5">48</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] pulse-dot" />
                <span className="text-[10px] font-medium text-slate-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-700/60 hidden lg:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center rounded-xl text-slate-500
            hover:text-slate-300 hover:bg-slate-700/50 transition-all duration-200 text-sm font-medium
            ${showLabels ? 'justify-center gap-2 px-3 py-2' : 'justify-center px-0 py-2'}`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
