import Link from '@/node_modules/next/link';
import React from 'react'
import { FaAngleRight } from "react-icons/fa6";

interface MenuProps {
  icons: React.ComponentType; 
  heading: string;
  reff:string
}

const Menu:React.FC<MenuProps> = ({icons : Icon , heading , reff}) => {
  return (
               <Link  href={reff} className='w-full flex justify-between  py-3 rounded-[9px] px-1 items-center hover:bg-[#5932ea] hover:opacity-100 hover:text-white opacity-45 h-fit'>
               {/* inner div for the logo and text  */}
                              <div className=' capitalize h-full font-semibold  flex gap-[10px]  items-center'>        

                              {/* this is the svg container */}

                                             <div className='text-[1.4rem] '>{Icon && <Icon />}</div>
                                             <h1 className='text-[1.1rem]'>{heading}</h1>
                              </div>

                              <div >
                                             <FaAngleRight/>
                              </div>
</Link>
  )
}

export default Menu