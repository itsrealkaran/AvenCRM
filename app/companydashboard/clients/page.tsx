"use client"
import React, { useState } from 'react'
import { IoIosSearch } from 'react-icons/io'
import { IoDownloadOutline } from 'react-icons/io5'
import { LuFilter } from 'react-icons/lu'
import { VscRefresh } from 'react-icons/vsc'
import MonitoringLeadList from '../components/MonitoringLeadList'
import MonitoringList from '../components/MonitoringList'

const Page = () => {

const [deal, setdeal] = useState(false)

const opendeal = ()=> { 
  setdeal(true)
}
const closedeal = ()=> { 
  setdeal(false)
}



  const bakaData = [1,2,3,4,5,6,7,7,8,8,8,8,]

  return (
    <div className='w-full h-full bg-[#F6F9FE] px-3 overflow-hidden'>

      <div className='w-full bg-white mt-3 '>
        {/* this is the top section should have made it a component but theek hai fuck it haven't made the system design for it next time will do fuck anukul chutiya anukul bas uski bandi mast hai naam bhul gaya uski bandi ka  */}
      <div className='w-full px-4 flex justify-between  items-center pt-5'>
                                                                           {/* this is the main heading */}
                                                                           <div className='flex items-center gap-3 '>
                                                                           <div onClick={()=>opendeal()} className={`${deal? "bg-[#5932EA]" : "bg-[#979797]"} text-white px-4 text-sm py-2  tracking-tight rounded-[4px]`}>
                                                                              <button>Deals</button>
                                                                            </div>
                                                                           <div onClick={()=>closedeal()}  className={` ${deal? "bg-[#979797]" : "bg-[#5932EA]" } text-white px-4 text-sm py-2  tracking-tight rounded-[4px]`}>
                                                                              <button>Leads</button>
                                                                            </div>
                                                                           </div>

                                                                            
                                                                           <div className='flex gap-4 text-[1rem] items-center  '>

                                                                         
                                                                            <div className='flex gap-4 opacity-70'>

                                                                            <IoIosSearch/>
                                                                           <VscRefresh/>
                                                                           <IoDownloadOutline/>
                                                                            </div>
                                                                           <div >

                                                                           <LuFilter/>
                                                                           </div>
                                                                           </div>


          </div>



          <div className='w-full flex justify-between  pl-14 pr-0   pb-5 items-center   mt-10 text-sm'>
            {deal ? ( <>

           
            <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] w-fit rounded-lg font-semibold text-[0.8rem] px-4  py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Name </h1>
            </div>
            </div>
            
            <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Status</h1>
            </div>
            </div>

            <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Deal Value</h1>
            </div>
            </ div>

            <div className='w-[14%] flex justify-center pr-5'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]   w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Email</h1>
            </div>
            </div>

            <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Expected close date</h1>
            </div>
            </div>

            <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>close probability</h1>
            </div>
            </ div>

              <div className='w-[14%]'>

            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  w-fit px-4 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Forcast value</h1>
            </div>
              </div>

          </>):(<>
            <div className='w-[25%] flex justify-center'>

<div className=' bg-[#F7F7FA] w-fit rounded-lg font-semibold text-[0.8rem] px-4  py-[5px]'>
                                                                                             <h1 className=' opacity-80'>Name </h1>
</div>
</div>
<div className='w-[25%] flex justify-center'>

<div className=' bg-[#F7F7FA] w-fit rounded-lg font-semibold text-[0.8rem] px-4  py-[5px]'>
                                                                                             <h1 className=' opacity-80'>Status </h1>
</div>
</div>
<div className='w-[25%] flex justify-center'>

<div className=' bg-[#F7F7FA] w-fit rounded-lg font-semibold text-[0.8rem] px-4  py-[5px]'>
                                                                                             <h1 className=' opacity-80'>Phone </h1>
</div>
</div>
<div className='w-[25%] flex justify-center'>

<div className=' bg-[#F7F7FA] w-fit rounded-lg font-semibold text-[0.8rem] px-4  py-[5px]'>
                                                                                             <h1 className=' opacity-80'>Email </h1>
</div>
</div>
            </>)}

            </div>
      </div>

      <div className='w-full mt-2 gap-3 flex flex-col h-[70vh] overflow-y-auto bg-white py-5 pb-10 px-3'>


        {/* this is going to be the monitorignList comp  */}

        { deal ? (

          bakaData.map((e,i)=>(
            
            <MonitoringList key={i}/>
            ))
            ): (
            bakaData.map((e,i)=>(

              <MonitoringLeadList key={i}/>
              ))
            )}
 

      </div>

    </div>

  )
}

export default Page