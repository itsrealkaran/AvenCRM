import SideNavBar from '@/app/component/SideNavBar'
import { TopNavigation } from '@/app/component/TopNavigation'
import React from 'react'

const page = () => {
  return (
    <div className='w-full h-screen flex'>
               <SideNavBar/>
               <div className='w-[82%] h-full'>
                              <TopNavigation/>
               </div>
    </div>
  )
}

export default page