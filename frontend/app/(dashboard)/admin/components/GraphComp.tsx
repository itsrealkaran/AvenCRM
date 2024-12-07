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
                <div style={{width:width +"%"}} className={` h-full overflow-hidden px-${padding} rounded-xl pt-2 bg-white  `}>
                                                                           <div className='w-full mt-1 px-4 flex justify-between items-center'>
                                                                                          <h1 className='font-bold text-[1.1rem] tracking-tight opacity-70'>{text}</h1>
                                                                                            <select className='outline-none bg-[#F8F8FF] px-2 py-1 rounded-xl text-xs opacity-80'  name="cars" id="cars">

                                                                                            <option value="volvo">Annual</option>
                                                                                            <option value="saab">Monthly</option>

                                                                                          </select>
                                                                           </div>

                                                                           <div className='w-full h-[85%]  '>
                                                                            <div className='w-full h-full  scale-[90%]'>
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