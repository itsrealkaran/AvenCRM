"use client"

import React, { useState } from 'react'

import { TbReportAnalytics, TbSettings2, TbUsers } from "react-icons/tb";
import { LuComputer } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import Link from '@/node_modules/next/link';
import Menu from './Menu';
import { SlCalender } from "react-icons/sl";


import { MdOutlineEmail, MdOutlineSubscriptions } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { PiBriefcase } from 'react-icons/pi';


const menuItems = [
  { heading: "manage user", icons: TbUsers, reff: "/companydashboard" },
  { heading: "clients", icons: PiBriefcase, reff: "/companydashboard/clients" },
  { heading: "monitoring", icons: LuComputer, reff: "/companydashboard/monitering" },
  { heading: "crash report", icons: TbReportAnalytics, reff: "/companydashboard/crashreport" },
  { heading: "subscription", icons: MdOutlineSubscriptions, reff: "/companydashboard/subscription" },
  { heading: "transaction", icons: GrTransaction, reff: "/companydashboard/transaction" },
  { heading: "calender", icons: SlCalender, reff: "/companydashboard/calender" },
  { heading: "email", icons: MdOutlineEmail, reff: "/companydashboard/email" },
  { heading: "settings", icons: IoSettingsOutline, reff: "/companydashboard/settings" }
];


const SideNavBar:React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>('manage user'); // This state tracks the active link

  // Function to handle the active menu item change
  const handleMenuClick = (id: string) => {
    setActiveLink(id);
  };

  return (
               <div className='h-screen z-10  w-[100%] sticky top-0 select-none bg-white shadow-xl shadow-black/20 pt-10 px-8'>

               {/* this is the top level heading display div  */}

               <div className='w-full flex items-center gap-[5px]'>

                              {/* this is the settings button */}

                              <div className='text-[2rem]'>
                              <TbSettings2 />
                              </div>

                              {/* this is the main heading  */}

                              <Link href="/dashboard" className='text-[1.24rem]  text-[#5932ea]   flex gap-[2px] items-end font-bold'>
                                             <h1>AvenCRM</h1>
                                             <span className='text-[10px] opacity-70 pb-[3px]'>v.01</span>
                              </Link>
               </div>

               <div className=' w-full mt-[35px] h-fit flex flex-col gap-[2px] '>
               
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
  )
}

export default SideNavBar