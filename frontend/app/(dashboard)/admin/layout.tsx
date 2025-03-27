'use client';

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Coins,
  Facebook,
  FileCheck2,
  FileText,
  Handshake,
  LayoutDashboard,
  Mail,
  PanelsTopLeft,
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
    path: '/admin',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Properties',
    icon: Building2,
    path: '/admin/property',
    description: 'Property management',
  },
  {
    heading: 'Tasks',
    icon: FileCheck2,
    path: '/admin/tasks',
    description: 'Task management',
  },
  {
    heading: 'Leads',
    icon: Users,
    path: '/admin/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Briefcase,
    path: '/admin/deals',
    description: 'Deal management',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/admin/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/admin/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/admin/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
  },
  {
    heading: 'Meta Ads',
    icon: Facebook,
    path: '/admin/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/admin/email',
    description: 'Communication hub',
  },
  {
    heading: 'Brochure Builder',
    icon: FileText,
    path: '/admin/brochure-builder',
    description: 'Create and manage brochures',
  },
  {
    heading: 'Page Builder',
    icon: PanelsTopLeft,
    path: '/admin/page-builder',
    description: 'Build and manage pages',
  },
  {
    heading: 'Team Manager',
    icon: Handshake,
    path: '/admin/manage-agents',
    description: 'User management',
  },
  {
    heading: 'Subscription',
    icon: Coins,
    path: '/admin/subscription',
    description: 'Subscription management',
  },
  {
    heading: 'Notifications',
    icon: Bell,
    path: '/admin/notification',
    description: 'Notification management',
  },
  // {
  //   heading: 'Monitoring',
  //   icon: Monitor,
  //   path: '/admin/monitoring',
  //   description: 'System monitoring',
  // },
  // {
  //   heading: 'Marketing',
  //   icon: LineChart,
  //   path: '/admin/marketing',
  //   description: 'Marketing management',
  // },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <div className='flex h-screen bg-slate-100 relative'>
        <Sidebar menuItems={menuItems} />
        <div className='flex-1 flex w-[82%] flex-col'>
          <Topbar />
          <main className='flex-1 overflow-y-auto p-4'>{children}</main>
        </div>
      </div>
    </CurrencyProvider>
  );
}
