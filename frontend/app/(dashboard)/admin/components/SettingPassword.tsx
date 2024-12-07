import React from 'react'
import { PiLockKeyOpenLight } from "react-icons/pi";
import { MdOutlineKeyOff } from "react-icons/md";
import { IoBagCheck } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";

const SettingPassword = () => {
  return (

               <div className=' w-full h-[80%]  flex  '>
               {/* left section  */}
               <div className='w-[55%] border-r-[2px] pt-12 border-black/20 h-full flex flex-col gap-7'>
                 <div className='w-full px-8 relative'>
                       <input className='w-full py-2 rounded-lg text-[0.9rem] bg-white border-[1px] outline-none border-black/20 pl-12 ' type="text" placeholder='Enter old Password' />
                       <div className='absolute top-1/2 -translate-y-1/2 text-[1.3rem] font-semibold opacity-70 left-12'>
                         <PiLockKeyOpenLight/>
                       </div>
                 </div>
                 <div className='w-full px-8 relative'>
                       <input className='w-full py-2 rounded-lg bg-white text-[0.9rem] border-[1px] outline-none border-black/20 pl-12 ' type="text" placeholder='Enter Password' />
                       <div className='absolute top-1/2 -translate-y-1/2 text-[1.3rem] font-semibold opacity-70 left-12'>
                         <MdOutlineKeyOff/>
                       </div>
                 </div>
                 <div className='w-full px-8 relative'>
                       <input className='w-full py-2 rounded-lg bg-white border-[1px] text-[0.9rem] outline-none border-black/20 pl-12 ' type="text" placeholder='Confirm Password' />
                       <div className='absolute top-1/2 -translate-y-1/2 text-[1.3rem] font-semibold opacity-70 left-12'>
                         <IoBagCheck/>
                       </div>
                 </div>
               </div>

               {/* right section */}
               <div className='w-[45%] flex flex-col gap-5 text-sm pt-7 h-full ml-5'>
                                     <div className='w-full flex gap-2 items-center'>
                                           <div className=' text-green-700  text-[1.8rem]  rounded-full '>
                                             <CiCircleCheck/>
                                           </div>
                                           <p className='opacity-70 leading-[1.3rem] w-[55%]'>Password length should be greater than 8.</p>
                                     </div>
                                     <div className='w-full flex gap-2 items-center'>
                                           <div className=' text-green-700  text-[1.8rem]  rounded-full '>
                                             <CiCircleCheck/>
                                           </div>
                                           <p className='opacity-70 leading-[1.3rem] w-[55%]'>Minimum 1 digit in password.</p>
                                     </div>
                                     <div className='w-full flex gap-2 items-center'>
                                           <div className=' text-green-700  text-[1.8rem]  rounded-full '>
                                             <CiCircleCheck/>
                                           </div>
                                           <p className='opacity-70 leading-[1.3rem] w-[55%]'>Minimum 1 capital letter in password.</p>
                                     </div>
                                     <div className='w-full flex gap-2 items-center'>
                                           <div className=' text-green-700  text-[1.8rem]  rounded-full '>
                                             <CiCircleCheck/>
                                           </div>
                                           <p className='opacity-70 leading-[1.3rem] w-[55%]'>Minimum 1 special letter in password like @,#,$.</p>
                                     </div>
                                     <div className='w-full flex gap-2 items-center'>
                                           <div className=' text-green-700  text-[1.8rem]  rounded-full '>
                                             <CiCircleCheck/>
                                           </div>
                                           <p className='opacity-70 leading-[1.3rem] w-[55%]'>Password should match with the confirm Password</p>
                                     </div>
               </div>
             </div>
  )
}

export default SettingPassword