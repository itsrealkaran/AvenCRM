'use client';

import React, { useState } from 'react';

import { TbReportAnalytics, TbSettings2, TbUsers } from 'react-icons/tb';
import { LuComputer } from 'react-icons/lu';
import { GrTransaction } from 'react-icons/gr';
import Link from '@/node_modules/next/link';
import Menu from './Menu';
import { SlCalender } from 'react-icons/sl';

import { MdOutlineEmail, MdOutlineSubscriptions } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { PiBriefcase } from 'react-icons/pi';

const menuItems = [
  { heading: 'manage user', icons: TbUsers, reff: '/companydashboard' },
  { heading: 'clients', icons: PiBriefcase, reff: '/companydashboard/clients' },
  {
    heading: 'monitoring',
    icons: LuComputer,
    reff: '/companydashboard/monitering',
  },
  {
    heading: 'crash report',
    icons: TbReportAnalytics,
    reff: '/companydashboard/crashreport',
  },
  {
    heading: 'subscription',
    icons: MdOutlineSubscriptions,
    reff: '/companydashboard/subscription',
  },
  {
    heading: 'transaction',
    icons: GrTransaction,
    reff: '/companydashboard/transaction',
  },
  {
    heading: 'calender',
    icons: SlCalender,
    reff: '/companydashboard/calender',
  },
  { heading: 'email', icons: MdOutlineEmail, reff: '/companydashboard/email' },
  {
    heading: 'settings',
    icons: IoSettingsOutline,
    reff: '/companydashboard/settings',
  },
];

const SideNavBar: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('/companydashboard'); // This state tracks the active link

  // Function to handle the active menu item change
  const handleMenuClick = (id: string) => {
    setActiveLink(id);
  };

  return (
    <div className="sticky top-0 z-10 h-screen w-[100%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20">
      {/* this is the top level heading display div  */}

      <div className="flex w-full items-center gap-[5px]">
        {/* this is the settings button */}

        <div className="text-[2rem]">
          <TbSettings2 />
        </div>

        {/* this is the main heading  */}

        <Link
          href="/dashboard"
          className="flex items-end gap-[2px] text-[1.24rem] font-bold text-[#5932ea]"
        >
          <h1>AvenCRM</h1>
          <span className="pb-[3px] text-[10px] opacity-70">v.01</span>
        </Link>
      </div>

      <div className="mt-[35px] flex h-fit w-full flex-col gap-[2px]">
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
