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
import Sidebar from '@/components/layout/Sidebar';

const getUserRole = () => {
  return 'teamleader';
};

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/teamleader',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Meta Ads',
    icon: LineChart,
    path: '/teamleader/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'Monitoring',
    icon: Monitor,
    path: '/teamleader/monitoring',
    description: 'System monitoring',
  },
  {
    heading: 'Properties',
    icon: Building2,
    path: '/teamleader/property',
    description: 'Property management',
  },
  {
    heading: 'Leads',
    icon: Store,
    path: '/teamleader/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Handshake,
    path: '/teamleader/deals',
    description: 'Deal management',
  },
  {
    heading: 'Page Builder',
    icon: FileText,
    path: '/teamleader/page-builder',
    description: 'Build and manage pages',
  },
  {
    heading: 'Marketing',
    icon: LineChart,
    path: '/teamleader/marketing',
    description: 'Marketing management',
  },
  {
    heading: 'Tasks',
    icon: CheckSquare,
    path: '/teamleader/tasks',
    description: 'Task management',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/teamleader/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/teamleader/email',
    description: 'Communication hub',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/teamleader/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Manage Team',
    icon: Users,
    path: '/teamleader/manage-team',
    description: 'Team management',
  },
  {
    heading: 'Team Monitoring',
    icon: Monitor,
    path: '/teamleader/team-monitoring',
    description: 'Monitor team performance',
  }
];

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
