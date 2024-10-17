import React from 'react'
import { FaAngleRight } from "react-icons/fa6";
import { FaKey } from "react-icons/fa6";

const Menu = ({icons , heading}) => {
  return (
               <div className='w-full flex justify-between  py-3 rounded-[9px] px-1 items-center hover:bg-[#5932ea] hover:opacity-100 hover:text-white opacity-45 h-fit'>
               {/* inner div for the logo and text  */}
                              <div className='w-1/2 capitalize h-full font-semibold  flex gap-[10px]  items-center'>        

                              {/* this is the svg container */}

                                             <div className='text-[1.25rem] '><FaKey/></div>
                                             <h1 className='text-[1.2rem]'>{heading}</h1>
                              </div>

                              <div >
                                             <icons/>
                              </div>
</div>
  )
}

export default Menu