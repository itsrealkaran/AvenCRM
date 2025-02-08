'use client';

import {
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  Facebook,
  FileText,
  Handshake,
  LayoutDashboard,
  LineChart,
  Mail,
  Monitor,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/teamleader',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Manage Team',
    icon: Users,
    path: '/teamleader/manage-team',
    description: 'Team management',
  },
  // {
  //   heading: 'Team Monitoring',
  //   icon: Monitor,
  //   path: '/teamleader/team-monitoring',
  //   description: 'Monitor team performance',
  // },
  {
    heading: 'Meta Ads',
    icon: Facebook,
    path: '/teamleader/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/teamleader/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
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
    heading: 'Notifications',
    icon: Bell,
    path: '/teamleader/notification',
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
