"use client"

import { ComboChartHero } from '@/app/admindashboard/components/ComboChartHero';
import React, { useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';

import { RiExpandUpDownLine } from 'react-icons/ri';
import FiltercompS from '../components/FiltercompS';
import { DonutChartHero } from '@/app/admindashboard/components/DonutChartHero';
import { BarListHero } from '@/app/admindashboard/components/BarListHero';
import GraphComp from '@/app/admindashboard/components/GraphComp';
import ListComp from '@/app/admindashboard/components/ListComp';

const dashboardData = [
  { text: "Crash Frequency", width: "40", Comp: ComboChartHero },
  { text: "User Impact", width: "30", Comp: DonutChartHero },
  { text: "Error Types", width: "30", Comp: BarListHero }
];

const ticketData = [
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
  { Name: "Tesla", date: "12/2/2", id: "PRE2022", username: "Arima Kousie", status: true },
];

const DashboardPage = () => {

  const [filterOpen, setfilterOpen] = useState(false)
  const closeFilter = ()=>{
    setfilterOpen(false)
  }


  return (
    <div className='w-full relative  h-full'>
      <div className='w-full bg-[#F0F5FC]  h-[100vh] overflow-hidden'>
        <div className='w-full px-3 h-[90%]'>
          <div className='w-full h-[40%] mt-4 flex gap-3'>
            {dashboardData.map((chart, index) => (
              <GraphComp padding={0} Comp={chart.Comp} key={index} text={chart.text} width={chart.width} />
            ))}
          </div>
          
          <div className='mt-5 bg-white w-full h-[8%] rounded-t-xl font-semibold flex items-center px-8 justify-between'>
            <div className='px-10 py-[5px] bg-[#F5F5FF] flex items-center gap-1 text-[1.3rem] rounded-md'>
              <IoIosSearch />
              <p className='text-[0.8rem] opacity-80'>Search</p>
            </div>
            <div className='px-10 py-[5px] bg-[#F5F5FF] flex items-center gap-3 text-[1rem] rounded-md'>
              <p className='text-[0.8rem] opacity-80'>Tickets Raised on</p>
              <RiExpandUpDownLine />
            </div>
            {/* Add more filter options as needed */}
            <div className='flex items-center gap-5 text-[1rem] rounded-md'>
              <div className='bg-[#F5F5FF] px-4 py-[5px] rounded-md'>
                <p className='text-[0.8rem] px-10 opacity-80'>Status</p>
              </div>
              <div className='flex gap-4'>
                <IoDownloadOutline />
 
                <div onClick={()=>setfilterOpen(prev=>!prev)}>

                                                                                          <LuFilter />

                 </div>
              </div>
            </div>
          </div>

          <div className='w-full h-[52%]  px-4 bg-white whitespace-nowrap gap-3 overflow-y-auto pt-5 rounded-b-xl flex flex-col'>
            {ticketData.map((ticket, index) => (
              <ListComp name={ticket.Name} username={ticket.username} date={ticket.date} id={ticket.id} status={ticket.status} key={index} />
            ))}
          </div>
        </div>
      </div>
      {filterOpen?(

                 
          <FiltercompS close={closeFilter}/>
      ):<></>
      }
    </div>
  );
}

export default DashboardPage;
