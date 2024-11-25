import React from 'react'

import { TbReportAnalytics, TbSettings2, TbUsers } from "react-icons/tb";
import { LuComputer } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import Link from '@/node_modules/next/link';
import { SlCalender } from "react-icons/sl";
import { MdOutlineEmail, MdOutlineSubscriptions } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { PiBriefcase } from 'react-icons/pi';
// import Menu from '@/app/companydashboard/components/Menu';



const SideNavBar:React.FC = () => {
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
                              {/* {[{heading:"Property" , icons:TbUsers , reff:"/PropertyDashboard"  } , {heading:"Marketing" , icons:PiBriefcase , reff:"/PropertyDashboard/marketing"  } ,{heading:"Page builder" , icons:LuComputer , reff:"/PropertyDashboard/pagebuilder" } , {heading:"Leads" , icons:TbReportAnalytics , reff:"/PropertyDashboard/leads" } ,   {heading:"Deals" , icons:MdOutlineSubscriptions , reff:"/PropertyDashboard/deals" } ,{heading:"monitoring" , icons:MdOutlineSubscriptions , reff:"/PropertyDashboard/monitoring" } , {heading:"transaction" , icons:GrTransaction , reff:"/PropertyDashboard/transaction"} ,{heading:"calender" , icons:SlCalender, reff:"/PropertyDashboard/calender" } ,{heading:"email" , icons:MdOutlineEmail, reff:"/PropertyDashboard/email" } ,{heading:"settings" , icons:IoSettingsOutline, reff:"/PropertyDashboard/setting" } ].map((e,i)=>(

                                            //  <Menu key={i} icons={e.icons}  heading={e.heading} reff={e.reff} />
                                             ))} */}
                           
               </div>
</div>
  )
}

export default SideNavBar