import React from 'react'
import { FaArrowUp } from "react-icons/fa";

const StatsOverview = () => {
  return (
<div className='w-full px-4 flex items-center justify-between py-3 bg-[#f5f5f5] rounded-xl '>
                        <div className='text-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Company</h1>
                          <h1 className='text-[1.2rem] font-semibold'>TATA</h1>
                        </div>

                        <div className='text-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Plan</h1>
                          <h1 className='text-[1.2rem] font-semibold'>Premium</h1>
                        </div>

                        <div className='text-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Next Due</h1>
                          <h1 className='text-[1.2rem] font-semibold'>Sep 30,24</h1>
                        </div>

                        <div className='text-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Assignee</h1>
                          <div className='flex gap-1 items-center'>
                            <div className='w-8 h-8 rounded-full overflow-hidden'>
                              <img className='w-full h-full object-cover' src="https://cdn.pixabay.com/photo/2023/10/24/09/21/portait-8337815_1280.jpg" alt="not showing" />
                            </div>
                          <h1 className='text-[1.1rem] font-semibold'>NikoChan</h1>
                          </div>
                        </div>

                        <div className='text-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Employee</h1>
                          <div className='flex gap-1 text-orange-400 items-center'>
                            <FaArrowUp/>
                          <h1 className='text-[1.1rem] font-semibold'>NikoChan</h1>
                          </div>
                        </div>
            </div>
  )
}

export default StatsOverview