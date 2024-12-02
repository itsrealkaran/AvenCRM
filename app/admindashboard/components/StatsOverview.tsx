import Image from 'next/image';
import React from 'react'
import { FaArrowUp } from "react-icons/fa";

interface val { 
  Cname : string , 
  plan : boolean , 
  date : string , 
  assignee : string , 
  imgUrl : string , 
  empName : string 
  open:boolean
  func : ()=>void
}

const StatsOverview:React.FC<val> = ({Cname , plan , date , assignee , imgUrl , empName , func , open}) => {
  return (
    <>
<div onClick={func} className='w-full cursor-pointer flex-shrink-0  flex items-center justify-between py-1 bg-[#f5f5f5] rounded-xl '>
                        <div className='text-center w-[20%] flex flex-col gap-1 items-center  leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Company</h1>
                          <h1 className='text-[0.85rem] opacity-70 font-bold'>{Cname}</h1>
                        </div>

                        <div className='text-center  w-[20%] leading-[1.3rem]'>
                          <h1 className='opacity-70 mb-1 text-[12px]'>Plan</h1>
                          <h1 className='text-[0.85rem] font-semibold  opacity-70'>{plan?"Premium" : "Basic"}</h1>
                        </div>

                        <div className='text-center w-[20%] leading-[1.3rem]'>
                          <h1 className='opacity-70 mb-1 text-[12px]'>Next Due</h1>
                          <h1 className='text-[0.85rem]  font-semibold  opacity-70'>{date}</h1>
                        </div>

                        <div className='text-center w-[20%] flex justify-center   flex-col items-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]  '>Assignee</h1>
                          <div className='flex gap-2  items-center  w-[50%]'>
                            <div className='w-8 h-8 rounded-full  overflow-hidden'>
                              <Image className='w-full h-full object-cover' src={imgUrl} alt="not showing" />
                            </div>
                          <h1 className='text-[0.85rem] font-semibold  opacity-70'>{assignee}</h1>
                          </div>
                        </div>

                        <div className='text-center w-[20%] flex gap-1  flex-col items-center leading-[1.3rem]'>
                          <h1 className='opacity-70 text-[12px]'>Employee</h1>
                          <div className='flex gap-2 w-[60%] text-center justify-start pl-10  text-orange-400 items-center'>
                            <FaArrowUp/>
                          <h1 className='text-[0.85rem]  font-semibold'>{empName}</h1>
                          </div>
                        </div>
            </div>
            {open? (

              <div className='absolute top-0 left-0 w-full h-screen overflow-hidden bg-white '>
            
              <button className="border-[1px] border-black" onClick={()=>func()}>go back</button>
            </div>
              ):<></>}
            </>
  )
}

export default StatsOverview