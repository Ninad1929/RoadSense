import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import StatCards from './components/Dashboard/StatCards';
import MapPlaceholder from './components/Map/MapPlaceholder';
import LiveFeed from './components/LiveFeed/LiveFeed';
import ReportsTable from './components/Reports/ReportsTable';
import dummyData from './data/dummyData.json';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main content — shifts based on sidebar */}
      <div
        className={`min-h-screen transition-[margin] duration-300 ease-in-out flex flex-col min-w-0
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ml-0`}
      >
        <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="p-4 md:p-6 lg:p-8 space-y-6 flex-1">
          {/* Stat Cards */}
          <section>
            <StatCards statistics={dummyData.statistics} />
          </section>

          {/* Map + Live Feed — map is 75%, feed is 25% on desktop */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9 h-full">
              <MapPlaceholder markers={dummyData.mapMarkers} />
            </div>
            <div className="lg:col-span-3 h-full">
              <LiveFeed feedData={dummyData.liveFeed} />
            </div>
          </section>

          {/* Reports Table — extra top spacing */}
          <section className="pt-4">
            <ReportsTable reports={dummyData.reports} />
          </section>
        </main>

        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            © 2026 SPOTHOLES — IoT-Based Road Health Monitoring System
          </p>
        </footer>
      </div>
    </div>
  );
}
