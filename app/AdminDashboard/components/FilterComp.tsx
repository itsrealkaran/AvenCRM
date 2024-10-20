import React from 'react'
import { MdOutlineCancel } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { IoIosSearch } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";

interface val {
               close:()=>void;
}

const FilterComp:React.FC<val> = ({close}) => {
  return (
               <div className='absolute top-0 w-full h-full  bg-blue-800/10 backdrop-blur-[2px] flex items-center justify-end px-5'>
               <div className='w-[27%] rounded-3xl h-[96%] bg-white'>
                 {/* this is the top part with cancel button  */}
                              <div className='w-full h-[11%] px-5 border-b-[1px] pt-2 border-black/20 flex items-center justify-between'>
                                             <div className='w-1/2 leading-[1.5rem] '>
                                                            <h1 className='text-[1.5rem] font-semibold'>Filters</h1>
                                                            <p className='text-[12px] opacity-70'>showing <span className='font-bold'>198</span> from <span className='font-bold'>893</span> results</p>
                                             </div>
                                             <div className='w-1/2 h-full flex justify-end items-center'>
                                                            <div onClick={close} className='w-[25%] text-black text-[1.5rem] rounded-lg h-[55%] bg-blue-800/20 flex items-center justify-center'>
                                                                           <MdOutlineCancel/>
                                                            </div>
                                             </div>

                              </div>

                 {/* this is the period selection part   */}

                 <div className='w-full h-[15%] flex items-start flex-col  mt-4 border-b-[1px] px-6 pt-2 border-black/20'>
                                                               <p className='font-semibold'>Period:</p>
                                                               <div className='relative w-full'>
                                                                 <input className='w-full mt-2 px-4 outline-none border-[1px] border-black/30 rounded-lg py-[5px]' type="text" placeholder='Select Period' />
                                                                 <div className='absolute top-3 text-[1.5rem] right-3'>
                                                                   <CiCalendar/>
                                                                 </div>
                                                               </div>
                 </div>
                 {/* this is the sort section  */}
                 <div className='w-full flex flex-col px-6 pt-5 border-b-[1px] border-black/20 pb-6 '>
                                                   <h1 className='text-[1.2rem] opacity-60  tracking-tight font-semibold'>Sort</h1>

                                                   <div className='flex items-center gap-5 mt-5'>
                                                   <input className='w-5 h-5 ' type="checkbox" />
                                                     <label className='font-semibold capitalize'>By due date</label>
                                                   </div>

                                                   <div className='flex items-center gap-5 mt-5'>
                                                   <input className='w-5 h-5' type="checkbox" />
                                                     <label className='font-semibold capitalize'>By user count</label>
                                                   </div>

                                                   <div className='flex items-center gap-5 mt-5'>
                                                   <input className='w-5 h-5' type="checkbox" />
                                                     <label className='font-semibold capitalize'>Testing</label>
                                                   </div>
                 </div>

                 {/* this is the designated person section */}

                 <div className='w-full px-6 pt-4 '>
                                                     <div className='relative w-full '>
                                                       <label className='font-semibold opacity-70'>Assignees</label>
                                                                 <input className='w-full mt-2 px-4 outline-none border-[1px] border-black/30 rounded-lg py-[5px]' type="text" placeholder='Search' />
                                                                 <div className='absolute top-10 text-[1.5rem] right-3'>
                                                                   <IoIosSearch/>
                                                                 </div>
                                                               </div>
                                                     <div className='relative mt-2 w-full '>
                                                       <label className='font-semibold opacity-70'>Estimate</label>
                                                                 <input className='w-full mt-2 px-4 outline-none border-[1px] border-black/30 rounded-lg py-[5px]' type="text" placeholder='Employees' />
                                                              
                                                               </div>
                                                     <div className='relative mt-2 w-full '>
                                                       <label className='font-semibold opacity-70'>Plan</label>
                                                                 <input className='w-full mt-2 px-4 outline-none border-[1px] border-black/30 rounded-lg py-[5px]' type="text" placeholder='Premium' />
                                                                 <div className='absolute top-10 text-[1.1rem] opacity-60 right-3'>
                                                                   <FaAngleDown/>
                                                                 </div>
                                                               </div>
                 </div>

                 {/* this is the button section  */}

                 <div className='w-full flex justify-center gap-6 items-center px-6 pt-5'>
                   <h1 className='font-semibold '>10 matches found</h1>
                   <div className='px-3 py-[6px] bg-[#3f8cff] rounded-lg text-white font-semibold '>
                     Save Filter(3)
                   </div>
                 </div>
               </div>
</div>
  )
}

export default FilterComp