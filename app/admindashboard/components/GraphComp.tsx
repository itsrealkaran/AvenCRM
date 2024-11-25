import React from 'react'
import { FaAngleDown } from "react-icons/fa6";


interface val{
               width:string,
               text:string
               padding : number 
               Comp:React.ComponentType
}

const GraphComp:React.FC<val> = ({width , text , Comp , padding}) => {
  return (
               <>
                <div style={{width:width +"%"}} className={` h-full overflow-hidden px-${padding} rounded-xl pt-2 bg-white shadow-lg shadow-black/10`}>
                                                                           <div className='w-full mt-1 px-4 flex justify-between items-center'>
                                                                                          <h1 className='font-bold text-[1.1rem] tracking-tight opacity-70'>{text}</h1>
                                                                                          <div className='px-5 relative text-[12px] tracking-tight rounded-full flex gap-2 items-center justify-between py-1 bg-[#f5f5ff]'>
                                                                                                         <h1>Annual</h1>
                                                                                                         <FaAngleDown/>
                                                                                          </div>
                                                                           </div>

                                                                           <div className='w-full h-[85%]  '>
                                                                            <div className='w-full h-full  scale-[85%]'>
                                                                                {Comp && 
                                                                                <Comp />
                                                                                }
                                                                            </div>
                                                                           </div>
                                                            </div>
               
               </>
  )
}

export default GraphComp