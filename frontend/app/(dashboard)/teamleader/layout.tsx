'use client';

import { CurrencyProvider } from '@/contexts/CurrencyContext';
import {
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  Briefcase,
  Facebook,
  FileText,
  LayoutDashboard,
  Mail,
  Monitor,
  PanelsTopLeft,
  Users,
  Handshake,
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
    heading: 'Properties',
    icon: Building2,
    path: '/teamleader/property',
    description: 'Property management',
  },
  {
    heading: 'Tasks',
    icon: CheckSquare,
    path: '/teamleader/tasks',
    description: 'Task management',
  },
  {
    heading: 'Leads',
    icon: Users,
    path: '/teamleader/leads',
    description: 'Lead management',
  },
  {
    heading: 'Deals',
    icon: Briefcase,
    path: '/teamleader/deals',
    description: 'Deal management',
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/teamleader/transactions',
    description: 'Transaction history',
  },
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/teamleader/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'WhatsApp',
    icon: FaWhatsapp,
    path: '/teamleader/whatsapp-campaign',
    description: 'Manage WhatsApp campaigns',
  },
  {
    heading: 'Meta Ads',
    icon: Facebook,
    path: '/teamleader/meta-ads',
    description: 'Manage Meta advertisements',
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/teamleader/email',
    description: 'Communication hub',
  },
  {
    heading: 'Brochure Builder',
    icon: FileText,
    path: '/teamleader/brochure-builder',
    description: 'Create and manage brochures',
  },
  {
    heading: 'Page Builder',
    icon: PanelsTopLeft,
    path: '/teamleader/page-builder',
    description: 'Build and manage pages',
  },
  // {
  //   heading: 'Monitoring',
  //   icon: Monitor,
  //   path: '/teamleader/monitoring',
  //   description: 'System monitoring',
  // },
  {
    heading: 'Team Manager',
    icon: Handshake,
    path: '/teamleader/manage-team',
    description: 'Team management',
  },
  {
    heading: 'Notifications',
    icon: Bell,
    path: '/teamleader/notification',
    description: 'Notification management',
  },
  // {
  //   heading: 'Team Monitoring',
  //   icon: Monitor,
  //   path: '/teamleader/team-monitoring',
  //   description: 'Monitor team performance',
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
