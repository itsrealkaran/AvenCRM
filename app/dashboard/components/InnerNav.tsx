import React from 'react'

const InnerNav = () => {
  return (
               <div className='w-full  flex items-center justify-between  h-[10%]'>
               {/*this is the toggel navigation section   */}
               <div className='w-1/2 font-semibold text-[14px]  flex gap-6 items-center '>
                 <h1 className=''>My details</h1>
                 <h1 className='opacity-70'>Password</h1>
                 <h1 className='opacity-70'>Notifications</h1>
               </div>

               {/* this is the button section */}
               <div className='w-1/2 flex items-center font-semibold gap-5 justify-end'>
                       <div className='py-[3px] px-4 border rounded-lg'>
                               Cancle
                       </div>
                       <div className='py-[3px] bg-[#5051f9] text-white px-4 border  rounded-lg'>
                               save
                       </div>
               </div>


 </div>
  )
}

export default InnerNav