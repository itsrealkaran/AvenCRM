import React from 'react'
import SideNavBar from '../component/SideNavBar'




const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>

               {/* this is the side navbar  */}

              <SideNavBar/>

              {/* this is the right div  */}

              <div className='w-[82%]  h-full '>
                              <div className='w-full px-5 py-1 flex justify-between items-center'>
                                             <div className='relative'>
                                                            <input className='outline-none py-2 px-3' type="text"  />
                                             </div>
                              </div>
              </div>
    </div>
  )
}

export default page