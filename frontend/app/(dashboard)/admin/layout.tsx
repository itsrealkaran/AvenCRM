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
  Settings,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

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
    heading: 'Meta Ads',
    icon: FaFacebook,
    path: '/admin/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/admin/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
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
  // {
  //   heading: 'Page Builder',
  //   icon: FileText,
  //   path: '/admin/page-builder',
  //   description: 'Build and manage pages',
  // },
  // {
  //   heading: 'Marketing',
  //   icon: LineChart,
  //   path: '/admin/marketing',
  //   description: 'Marketing management',
  // },
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
  {
    heading: 'Notifications',
    icon: Bell,
    path: '/admin/notification',
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
