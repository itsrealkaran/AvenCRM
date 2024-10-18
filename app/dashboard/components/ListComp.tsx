import React from 'react'

const ListComp = () => {
  return (
               <div className='w-full h-[22%] flex-shrink-0 bg-[#f5f5f5] flex items-center justify-between px-5  rounded-lg'>
               {/* logo with the name */}
               <div className='flex gap-4 items-center font-semibold text-[1.3rem] tracking-tight capitalize'>
                              <div className='w-12 h-12 rounded-lg overflow-hidden'>
                                             <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/258083/pexels-photo-258083.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing " />
                              </div>

                              <h1 className='opacity-70'>Tesla</h1>
               </div>

               <div className='opacity-60 text-[1rem]'>
                              <p>12/2/2</p>
               </div>

               <div className='opacity-60 uppercase text-[1rem]'>
                              <p>pre2290</p>
               </div>

               <div className='flex gap-2 items-center font-semibold text-[1rem] tracking-tight capitalize'>
                              <div className='w-8 h-8 rounded-full overflow-hidden'>
                                             <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/258083/pexels-photo-258083.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing " />
                              </div>

                              <h1 className='opacity-60'>Arima Kousie</h1>
               </div>

               <div className='opacity-80 text-blue-700  text-[1rem]'>
                              <p>Pending</p>
               </div>
</div>
  )
}

export default ListComp