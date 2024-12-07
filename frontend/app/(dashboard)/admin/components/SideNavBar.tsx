'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsCalendar2Date } from 'react-icons/bs';
import { CiMail, CiSettings, CiUser, CiWallet } from 'react-icons/ci';
import { FaChartLine } from 'react-icons/fa6';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { LuShieldAlert } from 'react-icons/lu';
import { TbSettings2 } from 'react-icons/tb';

import { cn } from '@/lib/utils';

import Menu from './Menu';

interface SideNavBarProps {
  current: string;
}

const menuItems = [
  {
    heading: 'Dashboard',
    icon: FaChartLine,
    href: '/admin',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Companies',
    icon: HiOutlineBuildingOffice2,
    href: '/admin/companies',
    description: 'Manage companies',
  },
  {
    heading: 'Calendar',
    icon: BsCalendar2Date,
    href: '/admin/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Payments',
    icon: CiWallet,
    href: '/admin/payment',
    description: 'Transaction history',
  },
  {
    heading: 'Email',
    icon: CiMail,
    href: '/admin/email',
    description: 'Communication hub',
  },
  {
    heading: 'Settings',
    icon: CiSettings,
    href: '/admin/settings',
    description: 'System preferences',
  },
] as const;

const SideNavBar: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('/admin'); // This state tracks the active link

  // Function to handle the active menu item change
  const handleMenuClick = (id: string) => {
    setActiveLink(id);
  };

  return (
    <div className='sticky top-0 z-10 h-screen w-[18%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20'>
      {/* this is the top level heading display div  */}

      <div className='flex w-full items-center gap-[5px]'>
        {/* this is the settings button */}

        <div className='text-[2rem]'>
          <TbSettings2 />
        </div>

        {/* this is the main heading  */}

        <Link
          href='/dashboard'
          className='flex items-end gap-[2px] text-[1.24rem] font-bold text-[#5932ea]'
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
            icons={item.icon}
            heading={item.heading}
            reff={item.href}
            isActive={activeLink === item.href} // Pass active state
            onClick={() => handleMenuClick(item.href)} // Set active link on click
          />
        ))}
      </div>
    </div>
  );
};

export default SideNavBar;
