import React from 'react'
import SideNavBar from '../component/SideNavBar'
import { CiSearch } from "react-icons/ci";




const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>

               {/* this is the side navbar  */}

              <SideNavBar/>

              {/* this is the right div  */}

              <div className='w-[82%]  h-full '>
                              <div className='w-full px-5 py-1 flex justify-between bg-[red] h-[10%] items-center'>
                                             <div className='relative w-[20%]'>
                                                            <input className='outline-none w-full py-1 rounded-[7px]  px-3 bg-[#f3f7fa]' type="text" placeholder='Search Anything...' />
                                                            <div className='absolute text-[1.3rem] top-[5px] right-2 '>
                                                            <CiSearch/>
                                                            </div>
                                             </div>
                              </div>
              </div>
    </div>
  )
}

export default page