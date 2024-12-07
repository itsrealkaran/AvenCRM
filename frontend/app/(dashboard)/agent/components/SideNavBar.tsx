'use client';

import React, { useState } from 'react';
import Link from '@/node_modules/next/link';
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
  { heading: 'Clients', icons: Users, reff: '/agent/clients' },
  {
    heading: 'Property',
    icons: Building2,
    reff: '/agent/property',
  },
  {
    heading: 'Marketing',
    icons: Target,
    reff: '/agent/marketing',
  },
  {
    heading: 'Page Builder',
    icons: FileText,
    reff: '/agent/subscription',
  },
  {
    heading: 'Leads',
    icons: Store,
    reff: '/agent/leads',
  },
  {
    heading: 'Deals',
    icons: HandshakeIcon,
    reff: '/agent/deals',
  },
  {
    heading: 'Transactions',
    icons: Wallet,
    reff: '/agent/transactions',
  },
  {
    heading: 'Monitoring',
    icons: LineChart,
    reff: '/agent/monitoring',
  },
  { heading: 'Email', icons: Mail, reff: '/agent/email' },
  {
    heading: 'Settings',
    icons: Settings,
    reff: '/agent/settings',
  },
];

const SideNavBar: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('/agent'); // This state tracks the active link

  // Function to handle the active menu item change
  const handleMenuClick = (id: string) => {
    setActiveLink(id);
  };

  return (
    <div className='sticky top-0 z-10 h-screen w-[18%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20'>
      {/* this is the top level heading display div  */}

      <div className='flex w-full items-center gap-[5px]'>
        {/* this is the settings button */}

        <div className='text-[2rem] text-primary'>
          <MenuIcon className='w-8 h-8' />
        </div>

        {/* this is the main heading  */}

        <Link
          href='/dashboard'
          className='flex items-end gap-[2px] text-[1.24rem] font-bold text-primary hover:text-primary/90 transition-colors'
        >
          <h1>AvenCRM</h1>
          <span className='pb-[3px] text-[10px] opacity-70'>v.01</span>
        </Link>
      </div>

      <div className='mt-[35px] flex h-fit w-full flex-col gap-[2px]'>
        {/* this is the single menu component  */}
        {menuItems.map((item, index) => (
          <Menu
            key={index}
            icons={item.icons}
            heading={item.heading}
            reff={item.reff}
            isActive={activeLink === item.reff} // Pass active state
            onClick={() => handleMenuClick(item.reff)} // Set active link on click
          />
        ))}
      </div>
    </div>
  );
};

export default SideNavBar;
