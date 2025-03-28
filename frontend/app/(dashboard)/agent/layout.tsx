'use client';

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Facebook,
  FileCheck2,
  FileText,
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
    path: '/agent',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Properties',
    icon: Building2,
    path: '/agent/property',
    description: 'Property management',
  },
  {
    heading: 'Tasks',
    icon: FileCheck2,
    path: '/agent/tasks',
    description: 'Task management',
  },
  {
    heading: 'Leads',
    icon: Users,
    path: '/agent/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Briefcase,
    path: '/agent/deals',
    description: 'Deal management',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/agent/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/agent/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/agent/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
  },
  {
    heading: 'Meta Ads',
    icon: Facebook,
    path: '/agent/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/agent/email',
    description: 'Communication hub',
  },
  {
    heading: 'Brochure Builder',
    icon: FileText,
    path: '/agent/brochure-builder',
    description: 'Create and manage brochures',
  },
  {
    heading: 'Page Builder',
    icon: PanelsTopLeft,
    path: '/agent/page-builder',
    description: 'Build and manage pages',
  },
  {
    heading: 'Notifications',
    icon: Bell,
    path: '/agent/notification',
    description: 'Notification management',
  },
  // {
  //   heading: 'Monitoring',
  //   icon: Monitor,
  //   path: '/agent/monitoring',
  //   description: 'System monitoring',
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
