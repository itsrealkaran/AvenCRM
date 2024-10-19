"use client"
import SideNavBar from '@/app/component/SideNavBar'
import { TopNavigation } from '@/app/component/TopNavigation'
import React from 'react'
import { FaAngleDown } from "react-icons/fa6";
import GraphComp from '../components/GraphComp';
import { IoIosSearch } from "react-icons/io";
import { RiExpandUpDownLine } from "react-icons/ri";
import { CiFilter } from "react-icons/ci";
import ListComp from '../components/ListComp';
import FilterComp from '../components/FilterComp';
import {useState} from "react"





const Page = () => {

  const [filterOpen, setfilterOpen] = useState(false)
  const closeFilter = ()=>{
    setfilterOpen(false)
  }
  return (
    <div className='w-full flex relative'>
               <SideNavBar/>
               <div className='w-[82%] bg-[#f7f9fe] h-[100vh]  overflow-hidden'>
                              <TopNavigation/>
                              
                              {/* outer container div */}
                              <div className='w-full px-3 h-[90%]'>
                                             <div className='w-full h-[40%] mt-4 flex gap-3 '>
                                                            {[{text:"Crash Frequency" , width:"40"}, {text:"User Impact" , width:"30"}, {text:"Error types" , width:"30"}].map((e,i)=>(

                                                                           <GraphComp key={i} text={e.text} width={e.width}/>
                                                            ))}
                                                       
                                             </div>
                                                                           
                                                                           {/* this is the option choosing thingy search thingy , in-between thingy fuck it  */}
                                             <div className='mt-5 bg-white w-full h-[8%] rounded-xl font-semibold flex items-center px-8 justify-between'>
                                                            <div className='px-4 py-[5px] bg-[#ebebf7] flex items-center gap-1 text-[1.3rem] rounded-md '>
                                                                           <IoIosSearch/>
                                                                           <p className='text-[1rem] opacity-80'>Search</p>
                                                            </div>
                                                            <div className='px-4 py-[5px] bg-[#ebebf7] flex items-center gap-3 text-[1rem] rounded-md '>
                                                                           <p className='text-[1rem] opacity-80'>Tickets Raised on</p>
                                                                           <RiExpandUpDownLine/>
                                                            </div>
                                                            <div className='px-5 py-[5px] bg-[#ebebf7] flex items-center gap-3 text-[1rem] rounded-md '>
                                                                           <p className='text-[1rem] opacity-80'>ID</p>
                                                            </div>
                                                            <div className='px-4 py-[5px] bg-[#ebebf7] flex items-center gap-3  tracking-tight text-[1rem] rounded-md '>
                                                                           <p className='text-[1rem] opacity-80'>Designated Person</p>
                                                            </div>
                                                            <div className=' flex   items-center gap-5   text-[1rem] rounded-md '>
                                                                           <div className='bg-[#ebebf7] px-4 py-[5px]  rounded-md'>

                                                                           <p className='text-[1rem] opacity-80'>Status</p>
                                                                           </div>
                                                                           
                                                                           <div className='flex gap-4'>
                                                                                          <FaAngleDown/>
                                                                                          <div onClick={()=>setfilterOpen(prev=>!prev)}>

                                                                                          <CiFilter/>
                                                                                          </div>
                                                                           </div>

                                                            </div>
                                                          
                                             </div>

                                             {/* this scroll thingy where you have to scroll down to see more of the stuff */}

                                             <div className='w-full h-[52%] px-4 bg-white whitespace-nowrap gap-5 overflow-y-auto pt-5 rounded-xl mt-5 flex flex-col '>
                                                                           {[{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:true },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false },{Name:"Tesla" , date:"12/2/2" , id:"PRE2022" , username:"Arima Kousie" ,status:false }].map((e,i)=>(
                                                                                          <ListComp name={e.Name} username={e.username} date={e.date} id={e.id} status={e.status} key={i}/>
                                                                                          ))}
                                             </div>
                              </div>
               </div>
               {filterOpen?(

                 
                 <FilterComp close={closeFilter}/>
                 ):<></>
               }

    </div>
  )
}

export default Page