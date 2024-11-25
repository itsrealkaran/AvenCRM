import Link from '@/node_modules/next/link';
import React from 'react'
import { FaAngleRight } from "react-icons/fa6";

interface MenuProps {
  icons: React.ComponentType; 
  heading: string;
  reff:string; 
  status: boolean | undefined
}


const Menu:React.FC<MenuProps> = ({icons : Icon , heading , reff , status}) => {

  console.log(status)
  return (
               <Link  href={reff} className={`w-full flex justify-between  py-[10px] rounded-[9px] pl-3 pr-[5px] items-center ${status ? "bg-[#5932ea] text-white" :"opacity-45"} hover:bg-[#5932ea]  hover:opacity-100 hover:text-white  h-fit`}>
               {/* inner div for the logo and text  */}
                              <div className=' capitalize h-full font-semibold  flex gap-[10px]  items-center'>        

                              {/* this is the svg container */}

                                             <div className='text-[1.2rem] '>{Icon && <Icon />}</div>
                                             <h1 className='text-[0.95rem]'>{heading}</h1>
                              </div>

                              <div >
                                             <FaAngleRight/>
                              </div>
</Link>
  )
}

export default Menu