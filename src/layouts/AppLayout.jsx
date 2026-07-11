import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="flex-1 p-6 space-y-6 w-full">
          <Outlet />
        </main>

        <footer className="border-t border-[#E2E8F0] bg-white px-6 py-4 mt-auto">
          <p className="text-xs text-slate-400 text-center font-medium">
            © 2026 SPOTHOLES — IoT-Based Road Health Monitoring System
          </p>
        </footer>
      </div>
    </div>
  );
}
