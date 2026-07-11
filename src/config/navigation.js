import {
  LayoutDashboard,
  Radio,
  FileText,
  BarChart3,
  Download,
  Settings,
} from 'lucide-react';

export const navItems = [
  {
    id: 'dashboard',
    path: '/',
    label: 'Dashboard',
    title: 'Dashboard',
    subtitle: 'Real-time road health monitoring overview',
    icon: LayoutDashboard,
  },
  {
    id: 'monitoring',
    path: '/live-monitoring',
    label: 'Live Monitoring',
    title: 'Live Monitoring',
    subtitle: 'Real-time monitoring of connected IoT devices',
    icon: Radio,
  },
  {
    id: 'reports',
    path: '/reports',
    label: 'Reports',
    title: 'Reports',
    subtitle: 'Historical road condition reports',
    icon: FileText,
  },
  {
    id: 'analytics',
    path: '/analytics',
    label: 'Analytics',
    title: 'Analytics',
    subtitle: 'Road health statistics and trends',
    icon: BarChart3,
  },
  {
    id: 'export',
    path: '/export',
    label: 'Export Data',
    title: 'Export Data',
    subtitle: 'Download reports in CSV/PDF format',
    icon: Download,
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    title: 'Settings',
    subtitle: 'Manage system configuration',
    icon: Settings,
  },
];

export function getPageMeta(pathname) {
  const match = navItems.find((item) =>
    item.path === '/' ? pathname === '/' : pathname === item.path
  );
  return match ?? navItems[0];
}
