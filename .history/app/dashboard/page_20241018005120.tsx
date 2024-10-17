import React from 'react'
import { TbSettings2 } from "react-icons/tb";


const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>
               <div className='h-full w-[17%] bg-white shadow-xl shadow-black/20 p-10'>
                              <div className='w-full flex items-center gap-2'>

                                             {/* this is the settings button */}

                                             <div className='text-[2.4rem]'>
                                             <TbSettings2 />
                                             </div>

                                             {/* this is the main heading  */}

                                             <div className='text-[1.5rem] flex items-end font-bold'>
                                                            <h1>Dashboard</h1>
                                                            <span className='text-[12px] pb-1'>v.01</span>
                                             </div>
                              </div>
               </div>
    </div>
  )
}

export default page