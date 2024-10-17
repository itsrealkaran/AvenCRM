import React from 'react'
import { FaAngleRight } from "react-icons/fa6";
import { FaKey } from "react-icons/fa6";

const Menu = ({icons : Icon , heading}) => {
  return (
               <div className='w-full flex justify-between  py-3 rounded-[9px] px-1 items-center hover:bg-[#5932ea] hover:opacity-100 hover:text-white opacity-45 h-fit'>
               {/* inner div for the logo and text  */}
                              <div className=' capitalize h-full font-semibold  flex gap-[10px]  items-center'>        

                              {/* this is the svg container */}

                                             <div className='text-[1.3rem] '>{Icon && <Icon />}</div>
                                             <h1 className='text-[1.1rem]'>{heading}</h1>
                              </div>

                              <div >
                                             <FaAngleRight/>
                              </div>
</div>
  )
}

export default Menu