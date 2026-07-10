import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import StatCards from './components/Dashboard/StatCards';
import MapView from './components/Map/MapView';
import LiveFeed from './components/LiveFeed/LiveFeed';
import ReportsTable from './components/Reports/ReportsTable';
import { getRoadReports } from './services/roadReportService';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [reports, setReports] = useState([]);

  // Load data from the service into React state
  useEffect(() => {
    let isMounted = true;
    const fetchReports = async () => {
      const data = await getRoadReports();
      if (isMounted) {
        setReports(data);
      }
    };
    fetchReports();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute statistics dynamically from reports state
  const statistics = useMemo(() => {
    let poor = 0;
    let moderate = 0;
    let good = 0;
    const devices = new Set();

    reports.forEach((report) => {
      if (report.condition === 'Poor') poor++;
      else if (report.condition === 'Moderate') moderate++;
      else if (report.condition === 'Good') good++;
      
      devices.add(report.deviceId);
    });

    return {
      totalReports: reports.length,
      poorRoads: poor,
      moderateRoads: moderate,
      goodRoads: good,
      activeDevices: devices.size,
      changes: { // Removed from UI, but kept structure in case StatCards expects it
        totalReports: 0,
        poorRoads: 0,
        moderateRoads: 0,
        goodRoads: 0,
        activeDevices: 0,
      }
    };
  }, [reports]);

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
            <StatCards statistics={statistics} />
          </section>

          {/* Map + Live Feed — map is 75%, feed is 25% on desktop */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[540px]">
            <div className="lg:col-span-9 h-full">
              <MapView reports={reports} />
            </div>
            <div className="lg:col-span-3 h-full">
              <LiveFeed feedData={reports} />
            </div>
          </section>

          {/* Reports Table — extra top spacing */}
          <section className="pt-4">
            <ReportsTable reports={reports} />
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
