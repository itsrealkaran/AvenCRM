"use client"
import React from 'react'
import GraphComp from './components/GraphComp'
import {useState} from "react"

import StatsOverview from './components/StatsOverview';
import FilterComp from './components/FilterComp'
import SideNavBar from './components/SideNavBar';
import { TopNavigation } from './components/TopNavigation';
import { LineChartHero } from './components/LineChartHero';
import { BarChartHero } from './components/BarChartHero';
import { DonutChartHero } from './components/DonutChartHero';
import { BarChartProfitLossExample } from './components/BarChartProfitLossExample';


// ye macro hai  puri gand baad mai maregi 



const Page = () => {
  const [filterOpen, setfilterOpen] = useState(false)

  const filterClose = () =>{
    setfilterOpen(false)
  }

  // api to get the graphs data 
  // 4 graphs  4 different data arrays needed 
  
  return (
    
    <div className='w-full h-screen bg-[#f0f5fc] overflow-hidden flex relative'>
      <SideNavBar current={"AdminDashboard"}/>
      <div className='w-[82%] bg-[#f0f5fc]  h-full'>
        <TopNavigation/>
        {/* outer div */}
        <div className='w-full h-[95%]  overflow-y-auto  px-3'>
          {/* this is the graph section  */}
          <div className='w-full h-[90%] bg-transparent overflow-hidden mt-4 justify-center flex  gap-2'>

            {/* left graph section  */}

            <div className='w-[40%] h-full flex flex-col gap-3'>
                        <div className='w-full h-[55%]  bg-white rounded-xl '>
                                    <GraphComp padding={2} Comp={LineChartHero} text='Sales Statistic' width='100'/>
                        </div>
                        <div className='w-full h-[45%] bg-white rounded-xl '>
                                    <GraphComp padding={2} Comp={DonutChartHero} text='Plan Status' width='100'/>
                        </div>
                        
            </div>

            {/* right graph section  */}

            <div className='w-[59%] h-full flex-col gap-3 flex '>
            <div className='w-full h-[50%] bg-white rounded-xl '>
                                    <GraphComp padding={10} Comp={BarChartHero} text='Renewal Status' width='100'/>
                        </div>
            <div className='w-full h-[50%] flex gap-2  rounded-xl '>
              <div className='w-[50%] h-full'>

                                    <GraphComp padding={2} Comp={BarChartProfitLossExample} text='Visitors' width='100'/>
              </div>
              <div className='w-[50%] h-full'>

                                    <GraphComp padding={2} Comp={LineChartHero} text='Revenue' width='100'/>
              </div>
                        </div>
            </div>
            

          </div>

          {/* this is the company stats page */}



        </div>

      </div>



    </div>
  )
}

export default Page