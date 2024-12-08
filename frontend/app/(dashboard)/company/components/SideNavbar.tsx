'use client';

import React, { useState } from 'react';
import Link from '@/node_modules/next/link';
import { GrTransaction } from 'react-icons/gr';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuComputer } from 'react-icons/lu';
import { MdOutlineEmail, MdOutlineSubscriptions } from 'react-icons/md';
import { PiBriefcase } from 'react-icons/pi';
import { SlCalender } from 'react-icons/sl';
import { TbReportAnalytics, TbSettings2, TbUsers } from 'react-icons/tb';

import Menu from './Menu';

const menuItems = [
  { heading: 'manage user', icons: TbUsers, reff: '/company' },
  { heading: 'clients', icons: PiBriefcase, reff: '/company/clients' },
  {
    heading: 'monitoring',
    icons: LuComputer,
    reff: '/company/monitoring',
  },
  {
    heading: 'subscription',
    icons: MdOutlineSubscriptions,
    reff: '/company/subscription',
  },
  {
    heading: 'transaction',
    icons: GrTransaction,
    reff: '/company/transaction',
  },
  {
    heading: 'calender',
    icons: SlCalender,
    reff: '/company/calendar',
  },
  { heading: 'email', icons: MdOutlineEmail, reff: '/company/email' },
  {
    heading: 'settings',
    icons: IoSettingsOutline,
    reff: '/company/settings',
  },
];

const SideNavBar: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('/company'); // This state tracks the active link

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
