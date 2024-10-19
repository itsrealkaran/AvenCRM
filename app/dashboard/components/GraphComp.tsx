import React from 'react'
import { FaAngleDown } from "react-icons/fa6";

interface val{
               width:string,
               text:string
}

const GraphComp:React.FC<val> = ({width , text}) => {
  return (
               <>
                <div style={{width:width +"%"}} className={` h-full overflow-hidden rounded-xl bg-white shadow-lg shadow-black/10`}>
                                                                           <div className='w-full mt-1 px-4 flex justify-between items-center'>
                                                                                          <h1 className='font-bold text-[1.4rem] tracking-tight opacity-70'>{text}</h1>
                                                                                          <div className='px-5 relative text-[12px] tracking-tight rounded-full flex gap-2 items-center justify-between py-1 bg-[#dadada]'>
                                                                                                         <h1>Annual</h1>
                                                                                                         <FaAngleDown/>
                                                                                          </div>
                                                                           </div>

                                                                           <div className='w-full h-[87%] bg-black/10'>

                                                                           </div>
                                                            </div>
               
               </>
  )
}

export default GraphComp