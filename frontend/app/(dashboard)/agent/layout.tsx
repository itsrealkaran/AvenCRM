'use client';

import {
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  Handshake,
  LayoutDashboard,
  LineChart,
  Mail,
  Monitor,
  Settings,
  Store,
  Users,
  Wallet,
} from 'lucide-react';

import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/Sidebar';

const getUserRole = () => {
  return 'teamleader';
};

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/agent',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Meta Ads',
    icon: LineChart,
    path: '/agent/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'Monitoring',
    icon: Monitor,
    path: '/agent/monitoring',
    description: 'System monitoring',
  },
  {
    heading: 'Properties',
    icon: Building2,
    path: '/agent/property',
    description: 'Property management',
  },
  {
    heading: 'Leads',
    icon: Store,
    path: '/agent/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Handshake,
    path: '/agent/deals',
    description: 'Deal management',
  },
  {
    heading: 'Page Builder',
    icon: FileText,
    path: '/agent/page-builder',
    description: 'Build and manage pages',
  },
  {
    heading: 'Marketing',
    icon: LineChart,
    path: '/agent/marketing',
    description: 'Marketing management',
  },
  {
    heading: 'Tasks',
    icon: CheckSquare,
    path: '/agent/tasks',
    description: 'Task management',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/agent/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/agent/email',
    description: 'Communication hub',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/agent/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Settings',
    icon: Settings,
    path: '/agent/settings',
    description: 'System preferences',
  },
];

if (getUserRole() === 'teamleader') {
  menuItems.push(
    {
      heading: 'Manage Team',
      icon: Users,
      path: '/agent/manage-team',
      description: 'Team management',
    },
    {
      heading: 'Team Monitoring',
      icon: Monitor,
      path: '/agent/team-monitoring',
      description: 'Monitor team performance',
    }
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen bg-slate-100 relative'>
      <Sidebar menuItems={menuItems} />
      <div className='flex-1 flex flex-col'>
        <Topbar />
        <main className='flex-1 overflow-y-auto p-4'>{children}</main>
      </div>
    </div>
  );
}
