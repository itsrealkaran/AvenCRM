import React from 'react'
import { CiBellOn } from "react-icons/ci";
import { FaQuestion } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { IoSearch } from 'react-icons/io5';


// done with it for now 

export const TopNavbar = () => {
  return (
               <div className='w-full px-5 shadow-lg shadow-black/10 z-10   flex justify-between bg-white h-[9%] items-center '>

               {/* this is the search bar  */}

               <div className='relative w-[20%]  '>
                              <input className='outline-none  border border-[#e8f0f6] w-full text-[12.5px] py-1  rounded-[7px]  px-3 bg-[#f3f7fa]' type="text" placeholder='Search anything...' />
                              <div className='absolute text-[1rem] top-[5px] right-4 opacity-50 font-bold  '>
                              <IoSearch/>
                              </div>
               </div>

               {/* this is the notification section  */}

               <div className='flex items-center gap-2'>
                              <div className='w-7 h-7 flex opacity-50 items-center justify-center text-[1.2rem]  rounded-[8px] border-black/70 border-[1px]'>
                                             <CiBellOn/>
                              </div>
                              <div className='w-7 h-7 flex items-center opacity-50 justify-center text-[1.1rem]  rounded-[8px] border-black/70 border-[1px]'>
                                             <FaQuestion/>
                              </div>

                              <div className='flex items-center gap-[6px]'>
                                             <div className='w-[37px] h-[37px] rounded-full  overflow-hidden ml-6'>
                                                            <img className='w-full h-full object-cover ' src="https://cdn.pixabay.com/photo/2022/12/01/04/43/girl-7628308_640.jpg" alt="not showing" />
                                             </div>
                                             <div className='leading-[0.8rem]'>
                                                            <h1 className='font-semibold text-[0.8rem] opacity-90'>Profile</h1>
                                                            <p className='text-[0.55rem] opacity-70'>Manager</p>
                                             </div>

                                             <div className='ml-1 opacity-70 '>
                                                            <FaAngleDown/>
                                             </div>
                              </div>
               </div>


               </div>
)
}
