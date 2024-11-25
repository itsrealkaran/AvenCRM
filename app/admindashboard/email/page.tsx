import React from 'react'
import SideNavBar from '../components/SideNavBar'
import { TopNavigation } from '../components/TopNavigation'

const page = () => {
  return (
    <div className='w-full flex '>
               <SideNavBar current={"email"}/>
               <div className='w-[82%] h-full'>
                              <TopNavigation/>
               </div>
    </div>
  )
}

export default page