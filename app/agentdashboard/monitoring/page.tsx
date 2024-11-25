"use client"

import { SingleLineChart } from '@/app/admindashboard/components/SingleLineChart'
import { RxDragHandleDots2 } from "react-icons/rx";


import { BsFunnel, BsThreeDots } from 'react-icons/bs'
import { ComboChartHero } from '@/app/admindashboard/components/ComboChartHero';

const page = () => {
  return (
    <div className='w-full h-full bg-[#F6F9FE]'>
               {/* top level div for the total agents and revenue divs  */}

               <div className='w-full flex items-center h-[38%]   gap-2'>
                              {/* this is one div  */}
                                             <div className='w-[33%] h-full bg-white rounded-xl border-[1px] border-black/20 '>
                                                            <div className='w-full items-center justify-between border-b-[1px] border-black/20 h-[15%] flex px-6'>
                                                                           {/* this is of the left side  */}
                                                                           <div className='flex items-center gap-[6px]'>
                                                                                          <h1 className='font-semibold opacity-80'>Total Agents</h1>
                                                                                          <div className='text-[0.75rem] pt-1 opacity-70'>

                                                                                          <BsFunnel/>
                                                                                          </div>
                                                                           </div>

                                                                           <div>
                                                                                          <BsThreeDots/>
                                                                           </div>
                                                            </div>

                                                            <div className='w-full h-[85%] text-[5.5rem] opacity-70 tracking-tight font-semibold pb-5 flex items-center justify-center'>
                                                                           <h1>1,92,00</h1>
                                                            </div>
                                             </div>


                                             <div className='w-[33%] h-full bg-white rounded-xl border-[1px] border-black/20 '>
                                                            <div className='w-full items-center justify-between border-b-[1px] border-black/20 h-[15%] flex px-6'>
                                                                           {/* this is of the left side  */}
                                                                           <div className='flex items-center gap-[6px]'>
                                                                                          <h1 className='font-semibold opacity-80'>Total Agents</h1>
                                                                                          <div className='text-[0.75rem] pt-1 opacity-70'>

                                                                                          <BsFunnel/>
                                                                                          </div>
                                                                           </div>

                                                                           <div>
                                                                                          <BsThreeDots/>
                                                                           </div>
                                                            </div>

                                                            <div className='w-full h-[85%] text-[5.5rem] opacity-70 tracking-tight font-semibold pb-5 flex items-center justify-center'>
                                                                           <h1>$1,92,00</h1>
                                                            </div>
                                             </div>


                                             <div className='w-[33%] h-full bg-white rounded-xl border-[1px] border-black/20 '>
                                                            <div className='w-full items-center justify-between border-b-[1px] border-black/20 h-[15%] flex px-6'>
                                                                           {/* this is of the left side  */}
                                                                           <div>
                                                                                          <h1 className='font-semibold opacity-80'>Revenue</h1>
                                                                                     
                                                                           </div>

                                                                           <div>
                                                                                          <BsThreeDots/>
                                                                           </div>
                                                            </div>

                                                            <div className='w-full h-[85%] px-4 text-[0.6rem] pb-4'>
                                                                           <SingleLineChart/>
                                                            </div>
                                             </div>


               </div>

               <div className='w-full rounded-xl h-[58%] bg-white border-[1px] border-black/20 mt-2'>
                              {/* this is the top level div  */}
                              <div className='w-full h-[12%] px-8 border-b-[1px] border-black/20 flex justify-between items-center'>
                                             <div className='flex items-center font-semibold opacity-70 gap-2'>
                                              <RxDragHandleDots2/>
                                                <h1 className='text-[1.1rem]'>Pipeline conversion</h1>
                                              <BsFunnel/>

                                             </div>
                                             <BsThreeDots/>
                              </div>
                              
                              <div className='w-full px-20 pb-2 h-[88%] '>
                                  <ComboChartHero/>
                              </div>

               </div>
    </div>
  )
}

export default page