'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Calendar,
  FileText,
  HandshakeIcon,
  LayoutDashboard,
  LineChart,
  Mail,
  MenuIcon,
  Settings,
  Store,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

import Menu from './Menu';

const menuItems = [
  { heading: 'Dashboard', icons: LayoutDashboard, reff: '/agent' },
  { heading: 'Property', icons: Building2, reff: '/agent/property' },
  { heading: 'Page Builder', icons: FileText, reff: '/agent/page-builder' },
  { heading: 'Leads', icons: Store, reff: '/agent/leads' },
  { heading: 'Deals', icons: HandshakeIcon, reff: '/agent/deals' },
  { heading: 'Transactions', icons: Wallet, reff: '/agent/transactions' },
  { heading: 'Calendar', icons: Calendar, reff: '/agent/calendar' },
  { heading: 'Email', icons: Mail, reff: '/agent/email' },
  { heading: 'Settings', icons: Settings, reff: '/agent/settings' },
];

const SideNavBar: React.FC = () => {
  const pathname = usePathname(); // Get the current pathname

  return (
    <div className='sticky top-0 z-10 h-screen w-[18%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20'>
      {/* Top heading */}
      <div className='flex w-full items-center gap-[5px]'>
        <div className='text-[2rem] text-primary'>
          <MenuIcon className='w-8 h-8' />
        </div>

        <Link
          href='/dashboard'
          className='flex items-end gap-[2px] text-[1.24rem] font-bold text-primary hover:text-primary/90 transition-colors'
        >
          <h1>AvenCRM</h1>
          <span className='pb-[3px] text-[10px] opacity-70'>v.01</span>
        </Link>
      </div>

      {/* Navigation menu */}
      <div className='mt-[35px] flex h-fit w-full flex-col gap-[2px]'>
        {menuItems.map((item, index) => (
          <Menu
            key={index}
            icons={item.icons}
            heading={item.heading}
            reff={item.reff}
            isActive={pathname === item.reff} // Compare pathname to item.reff
          />
        ))}
      </div>
    </div>
  );
};

export default SideNavBar;
