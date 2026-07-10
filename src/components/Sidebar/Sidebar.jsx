import {
  LayoutDashboard,
  Radio,
  FileText,
  BarChart3,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'monitoring', label: 'Live Monitoring', icon: Radio },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'export', label: 'Export Data', icon: Download },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, activeNav, setActiveNav, isMobileOpen, setIsMobileOpen }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 transition-transform lg:transition-all duration-300 ease-in-out flex flex-col
        bg-white border-r border-slate-200
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-wide flex flex-col leading-tight">
              <span className="text-slate-900 font-extrabold tracking-widest text-base">SPOTHOLES</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Road Monitoring System</span>
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                setIsMobileOpen(false); // close drawer on click for mobile
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              {(!isCollapsed || isMobileOpen) && (
                <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Devices Box */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Active Devices</span>
            <span className="text-xl font-extrabold text-slate-800 leading-tight block">48</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-500">Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle for Desktop */}
      <div className="p-3 border-t border-slate-100 hidden lg:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-150 text-sm font-medium"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
