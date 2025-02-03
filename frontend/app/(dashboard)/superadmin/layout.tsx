'use client';

import {
  Bell,
  Building,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  Mail,
  Settings,
  Wallet,
} from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/superadmin',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Companies',
    icon: Building,
    path: '/superadmin/companies',
    description: 'Manage companies',
  },
  {
    heading: 'Tasks',
    icon: CheckSquare,
    path: '/superadmin/tasks',
    description: 'Task management',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/superadmin/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/superadmin/email',
    description: 'Communication hub',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/superadmin/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Settings',
    icon: Settings,
    path: '/superadmin/settings',
    description: 'System preferences',
  },
  {
    heading: 'Notifications',
    icon: Bell,
    path: '/superadmin/notification',
    description: 'Notification management',
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen bg-slate-100 relative'>
      <Sidebar menuItems={menuItems} />
      <div className='flex-1 flex w-[82%] flex-col'>
        <Topbar />
        <main className='flex-1 overflow-y-auto p-4'>{children}</main>
      </div>
    </div>
  );
}
