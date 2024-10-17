import React from 'react'
import SideNavBar from '../component/SideNavBar'




const page = () => {
  return (
    <div className='w-full h-screen flex bg-[#fafbff]'>
               {/* this is the side navbar  */}
              <SideNavBar/>
              <div className='w-[82%] bg-red-500 h-full'></div>
    </div>
  )
}

export default page