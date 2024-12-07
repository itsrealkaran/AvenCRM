import React from 'react';
import Link from '@/node_modules/next/link';
import { GrTransaction } from 'react-icons/gr';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuComputer } from 'react-icons/lu';
import { MdOutlineEmail, MdOutlineSubscriptions } from 'react-icons/md';
import { PiBriefcase } from 'react-icons/pi';
import { SlCalender } from 'react-icons/sl';
import { TbReportAnalytics, TbSettings2, TbUsers } from 'react-icons/tb';

// import Menu from '@/app/companydashboard/components/Menu';

const SideNavBar: React.FC = () => {
  return (
    <div className='h-screen z-10  w-[100%] sticky top-0 select-none bg-white shadow-xl shadow-black/20 pt-10 px-8'>
      {/* this is the top level heading display div  */}

      <div className='w-full flex items-center gap-[5px]'>
        {/* this is the settings button */}

        <div className='text-[2rem]'>
          <TbSettings2 />
        </div>

        {/* this is the main heading  */}

        <Link
          href='/dashboard'
          className='text-[1.24rem]  text-[#5932ea]   flex gap-[2px] items-end font-bold'
        >
          <h1>AvenCRM</h1>
          <span className='text-[10px] opacity-70 pb-[3px]'>v.01</span>
        </Link>
      </div>

      <div className=' w-full mt-[35px] h-fit flex flex-col gap-[2px] '>
        <div className='w-full flex items-center gap-[5px]'>
          <div className='text-[1.2rem]'>
            <TbReportAnalytics />
          </div>
          <Link href='/dashboard' className='text-[0.9rem] font-semibold'>
            Dashboard
          </Link>
        </div>
        <div className='w-full flex items-center gap-[5px]'>
          <div className='text-[1.2rem]'>
            <TbUsers />
          </div>
          <Link href='/agent' className='text-[0.9rem] font-semibold'>
            Agents
          </Link>
        </div>
        <div className='w-full flex items-center gap-[5px]'>
          <div className='text-[1.2rem]'>
            <GrTransaction />
          </div>
          <Link href='/transactions' className='text-[0.9rem] font-semibold'>
            Transactions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideNavBar;
