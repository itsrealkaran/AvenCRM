"use client"
import React from 'react'
import GraphComp from './components/GraphComp'
import {useState} from "react"
import { IoIosSearch } from "react-icons/io";
import { FiRefreshCw } from "react-icons/fi";
import { FaArrowDown } from "react-icons/fa";
import { CiFilter } from "react-icons/ci";
import StatsOverview from './components/StatsOverview';
import FilterComp from './components/FilterComp'
import SideNavBar from './components/SideNavBar';
import { TopNavigation } from './components/TopNavigation';
import { LineChartHero } from './components/LineChartHero';
import { BarChartHero } from './components/BarChartHero';
import { DonutChartHero } from './components/DonutChartHero';

const Page = () => {
  const [filterOpen, setfilterOpen] = useState(false)

  const filterClose = () =>{
    setfilterOpen(false)
  }
  return (
    <div className='w-full h-screen bg-[#f0f5fc] flex relative'>
      <SideNavBar current={"AdminDashboard"}/>
      <div className='w-[82%]  h-full'>
        <TopNavigation/>
        {/* outer div */}
        <div className='w-full h-[90%]  overflow-y-auto  px-3'>
          {/* this is the graph section  */}
          <div className='w-full h-[85%] overflow-hidden mt-4 justify-center flex  gap-4'>

            {/* left graph section  */}

            <div className='w-[40%] h-full flex flex-col gap-3'>
                        <div className='w-full h-[45%] bg-white rounded-xl '>
                                    <GraphComp Comp={LineChartHero} text='Sales Statistic' width='100'/>
                        </div>
                        <div className='w-full h-[55%] bg-white rounded-xl '>
                                    <GraphComp Comp={DonutChartHero} text='Plan Status' width='100'/>
                        </div>
                        
            </div>

            {/* right graph section  */}

            <div className='w-[58%] h-full flex-col gap-3 flex '>
            <div className='w-full h-[50%] bg-white rounded-xl '>
                                    <GraphComp Comp={BarChartHero} text='Renewal Status' width='100'/>
                        </div>
            <div className='w-full h-[50%] flex gap-2 bg-white rounded-xl '>
              <div className='w-[45%] h-full'>

                                    <GraphComp Comp={BarChartHero} text='visitors' width='100'/>
              </div>
              <div className='w-[55%] h-full'>

                                    <GraphComp Comp={LineChartHero} text='Revenue' width='100'/>
              </div>
                        </div>
            </div>
            

          </div>

          {/* this is the company stats page */}

          <div className='w-full bg-white  pt-5 mt-3 rounded-xl'>
            {/* this is the same as the payment thingy not making in component though kyu ki bhai time ni hai  */}
          <div className='w-full px-4 flex justify-between items-center'>
                                                                           {/* this is the main heading */}
                                                                           <div className='text-[1.5rem] font-bold tracking-tight'>Company Invoices</div>

                                                                           <div className='flex gap-4 text-[1.2rem] opacity-70 '>
                                                                           <IoIosSearch/>
                                                                           <FiRefreshCw/>
                                                                           <FaArrowDown/>
                                                                           <div onClick={()=>setfilterOpen(prev=>!prev)}>

                                                                           <CiFilter/>
                                                                           </div>
                                                                           </div>


          </div>

          {/* the stats contaier */}

          <div className=' px-3 flex flex-col w-full gap-3 pt-5'>
            {[1,2,4,5,6,4,7].map((e,i)=>(

              <StatsOverview key={i}/>
            ))}
          </div>

          </div>

        </div>

      </div>

    {filterOpen?(
      <FilterComp close={filterClose}/>
    ):<></>}


    </div>
  )
}

export default Page