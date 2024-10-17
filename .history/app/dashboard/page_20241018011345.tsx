import React from 'react'
import { TbSettings2 } from "react-icons/tb";
import { FaKey as fa } from "react-icons/fa6";
import Menu from './components/Menu';



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

                                            <Menu/>
                              </div>
               </div>
    </div>
  )
}

export default page