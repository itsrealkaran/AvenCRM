import React from 'react'
import { TbSettings2 } from "react-icons/tb";
import { FaKey } from "react-icons/fa6";


const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>
               <div className='h-full w-[17%] bg-white shadow-xl shadow-black/20 p-10'>

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

                                             <div className='w-full flex justify-between items-center h-fit'>
                                                            {/* inner div for the logo and text  */}
                                                                           <div className='w-1/2 capitalize h-full flex gap-2 items-center'>          

                                                                           {/* this is the svg container */}

                                                                                          <div className='text-[1.3rem] opacity-45'><FaKey/></div>
                                                                                          <h1>dashboard</h1>
                                                                           </div>
                                             </div>
                              </div>
               </div>
    </div>
  )
}

export default page