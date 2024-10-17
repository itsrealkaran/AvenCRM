import React from 'react'

import { TbSettings2 } from "react-icons/tb";
import { FaKey  } from "react-icons/fa6";
import { BsCalendar2Date } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { CiWallet } from "react-icons/ci";
import { CiSquareQuestion } from "react-icons/ci";
import Menu from '../dashboard/components/Menu';

const SideNavBar = () => {
  return (
               <div className='h-full w-[18%] bg-white shadow-xl shadow-black/20 pt-10 px-8'>

               {/* this is the top level heading display div  */}

               <div className='w-full flex items-center gap-1'>

                              {/* this is the settings button */}

                              <div className='text-[2.4rem]'>
                              <TbSettings2 />
                              </div>

                              {/* this is the main heading  */}

                              <div className='text-[1.6rem]  text-[#5932ea]  flex gap-[2px] items-end font-bold'>
                                             <h1>Dashboard</h1>
                                             <span className='text-[12px] opacity-70 pb-1'>v.01</span>
                              </div>
               </div>

               <div className=' w-full mt-14 h-fit flex flex-col gap-2 '>

                              {/* this is the single menu component  */}

                              {[{heading:"dashboard" , icons:FaKey} ,{heading:"calender" , icons:BsCalendar2Date} , {heading:"crash report" , icons:CiUser} ,   {heading:"payments" , icons:CiWallet} , {heading:"Email" , icons:CiWallet} ,{heading:"Settings" , icons:CiSquareQuestion} ,  ].map((e,i)=>(

                                             
                                             <Menu key={i} icons={e.icons}  heading={e.heading}/>
                                             ))}
                           
               </div>
</div>
  )
}

export default SideNavBar