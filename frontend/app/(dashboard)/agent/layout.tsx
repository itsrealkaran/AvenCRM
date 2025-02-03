'use client';

import {
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  Handshake,
  LayoutDashboard,
  LineChart,
  Mail,
  Monitor,
  Store,
  Wallet,
} from 'lucide-react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

const menuItems = [
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/agent',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Meta Ads',
    icon: FaFacebook,
    path: '/agent/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/agent/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
  },
  // {
  //   heading: 'Monitoring',
  //   icon: Monitor,
  //   path: '/agent/monitoring',
  //   description: 'System monitoring',
  // },
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
  // {
  //   heading: 'Page Builder',
  //   icon: FileText,
  //   path: '/agent/page-builder',
  //   description: 'Build and manage pages',
  // },
  // {
  //   heading: 'Marketing',
  //   icon: LineChart,
  //   path: '/agent/marketing',
  //   description: 'Marketing management',
  // },
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
    heading: 'Notifications',
    icon: Bell,
    path: '/agent/notification',
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
