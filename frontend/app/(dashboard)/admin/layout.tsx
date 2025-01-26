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

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Manage Agents',
    icon: Users,
    path: '/admin/manage-agents',
    description: 'User management',
  },
  {
    heading: 'Subscription',
    icon: Wallet,
    path: '/admin/subscription',
    description: 'Subscription management',
  },
  // {
  //   heading: 'Monitoring',
  //   icon: Monitor,
  //   path: '/admin/monitoring',
  //   description: 'System monitoring',
  // },
  {
    heading: 'Properties',
    icon: Building2,
    path: '/admin/property',
    description: 'Property management',
  },
  {
    heading: 'Leads',
    icon: Store,
    path: '/admin/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Handshake,
    path: '/admin/deals',
    description: 'Deal management',
  },
  {
    heading: 'Page Builder',
    icon: FileText,
    path: '/admin/page-builder',
    description: 'Build and manage pages',
  },
  {
    heading: 'Marketing',
    icon: LineChart,
    path: '/admin/marketing',
    description: 'Marketing management',
  },
  {
    heading: 'Tasks',
    icon: CheckSquare,
    path: '/admin/tasks',
    description: 'Task management',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/admin/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/admin/email',
    description: 'Communication hub',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/admin/transactions',
    description: 'Transaction history',
  },
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
