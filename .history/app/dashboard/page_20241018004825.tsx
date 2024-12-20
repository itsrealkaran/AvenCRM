import React from 'react'
import { TbSettings2 } from "react-icons/tb";


const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>
               <div className='h-full w-[17%] bg-white shadow-xl shadow-black/20 p-10'>
                              <div className='w-full flex items-center gap-3'>
                                             {/* this is the settings button */}
                                             <div className='text-[2.4rem]'>

                                             <TbSettings2 />
                                             </div>

                              </div>
               </div>
    </div>
  )
}

export default page