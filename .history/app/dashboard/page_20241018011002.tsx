import React from 'react'
import { TbSettings2 } from "react-icons/tb";
import { FaKey } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";


const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>
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

                              <div className=' w-full mt-20 h-fit flex flex-col '>

                                             {/* this is the single menu component  */}

                                             <div className='w-full flex justify-between  py-3 rounded-[9px] px-1 items-center hover:bg-black opacity-45 h-fit'>
                                                            {/* inner div for the logo and text  */}
                                                                           <div className='w-1/2 capitalize h-full font-semibold  flex gap-[10px]  items-center'>        

                                                                           {/* this is the svg container */}

                                                                                          <div className='text-[1.25rem] '><FaKey/></div>
                                                                                          <h1 className='text-[1.2rem]'>dashboard</h1>
                                                                           </div>

                                                                           <div >
                                                                                          <FaAngleRight/>
                                                                           </div>
                                             </div>
                              </div>
               </div>
    </div>
  )
}

export default page