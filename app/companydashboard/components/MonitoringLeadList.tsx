import React from 'react'

const MonitoringLeadList = () => {
  return (
               <div className='pl-10 py-5 bg-[#F5F5F5]  text-sm tracking-tight font-semibold rounded-lg flex justify-between items-center'>

               {/* this is the image div with name  */}

               <div className='flex items-center w-[25%]  justify-center gap-2'>
                 <div className='w-6 h-6 rounded-full overflow-hidden'>
                   <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/14840712/pexels-photo-14840712.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="not showing" />
                 </div>
                 <h1 className='opacity-80' >isagi yoichi</h1>
               </div>

               {/* this is the proposal status div */}

               <div className='text-blue-700 opacity-80 pl-5 w-[25%] flex justify-center'>
                 <h1>proposal</h1>
               </div>

               {/* this is the phone div */}

               <div className='w-[25%] flex pl-8 opacity-80 justify-center'>
                 <h1>8005604543</h1>
               </div>

               {/* this is the email div  */}

               <div className='w-[25%] opacity-80 flex justify-center'>
                 <h1>niko@han356.gmail.com</h1>
               </div>


             </div>
  )
}

export default MonitoringLeadList