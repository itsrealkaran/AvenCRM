import React from 'react'

import { TbSettings2 } from "react-icons/tb";
import { FaKey  } from "react-icons/fa6";
import { BsCalendar2Date } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { CiWallet } from "react-icons/ci";
import { CiSquareQuestion } from "react-icons/ci";
import Link from '@/node_modules/next/link';
import Menu from './Menu';

// done with it for now  w-[18%]

interface val { 
  current : string
}

const SideNavBar:React.FC<val> = ({current}) => {
  return (
               <div className='h-screen w-[18%] sticky top-0 select-none bg-white shadow-xl shadow-black/20 pt-10 px-8'>

               {/* this is the top level heading display div  */}

               <div className='w-full flex items-center gap-1'>

                              {/* this is the settings button */}

                              <div className='text-[2.4rem]'>
                              <TbSettings2 />
                              </div>

                              {/* this is the main heading  */}

                              <Link href="/dashboard" className='text-[1.6rem]  text-[#5932ea]  flex gap-[2px] items-end font-bold'>
                                             <h1>AvenCRM</h1>
                                             <span className='text-[12px] opacity-70 pb-1'>v.01</span>
                              </Link>
               </div>

               <div className=' w-full mt-[50px] h-fit flex flex-col gap-2 '>

                              {/* this is the single menu component  */}

                              {[{heading:"dashboard" , icons:FaKey , reff:"/AdminDashboard", status : current === "AdminDashboard" } ,{heading:"calender" , icons:BsCalendar2Date , reff:"/AdminDashboard/calender" , status : current === "calender"} , {heading:"crash report" , icons:CiUser , reff:"/AdminDashboard/crashReport" , status : current === "crash Report"} ,   {heading:"payments" , icons:CiWallet , reff:"/AdminDashboard/payment" , status : current === "payment"} , {heading:"Email" , icons:CiWallet , reff:"/AdminDashboard/email"} ,{heading:"Settings" , icons:CiSquareQuestion, reff:"/AdminDashboard/settings" ,  status : current === "settings"} ].map((e,i)=>(

                                             
                                             <Menu key={i} icons={e.icons}  heading={e.heading} reff={e.reff} status = {e.status}/>
                                             ))}
                           
               </div>
</div>
  )
}

export default SideNavBar