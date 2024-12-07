import React from 'react'
import InputField from './InputField'
import Option from './Option'

import { CiImageOn } from "react-icons/ci";
import { IoMdColorFilter } from "react-icons/io";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import { FaAlignLeft } from "react-icons/fa";
import { CiLink } from "react-icons/ci";

const SettingDetails = () => {
  return (
               <div className='w-full h-fit  flex pb-5'>

               {/* left div  */}
             <div className='w-1/2 h-full pr-12 border-r-[3px] border-black/10 '>

               {/* this will be one single component nahh no need it is not used anywhere else so fuck it no component for you  */}
                       <div className='w-full uppercase  tracking-tight mt-5 text-sm'>
                         <p className='font-semibold  text-[10px] opacity-80'>Username</p>
                         <input className='outline-none bg-transparent mt-2 w-full border-b-[1px] border-black/50 border-dashed' type="text" placeholder='NikoChan256'/>
                       </div>

                       <div className='w-full uppercase tracking-tight text-sm mt-7'>
                         <p className='font-semibold text-[10px] opacity-80'>Status</p>
                         <input className='outline-none bg-transparent w-full mt-2 border-b-[1px] border-black/50 border-dashed' type="text" placeholder='Active' />
                       </div>

                   {/* this is the buffer thingy avoiding it for now  */}
                   <div className='w-full h-[8%] bg-[#f3f4f7] mt-10 rounded-[8px]'></div>

                   {/* now the last section of the left div the info details section  */}

                   <div className='flex w-full mt-5 justify-between'>
                         <div className='w-[49%] '>
                       {["work phone" , "mobile"].map((e,i)=>(

                         <InputField key={i} text={e}/>
                         ))}
                         </div>
                         <div className='w-[49%]  '>
                             {["email" , "address"].map((e,i)=>(

                         <InputField key={i} text={e}/>
                         ))}
                         
                         </div>
                   </div>

             </div>

               {/* right div  */}
             <div className='w-1/2 h-full pl-12'>

               {/* this is the  */}
               <div className='w-full mt-8'>
                 {["first name" , "last name"].map((e,i)=>(
                   <InputField key={i} text={e}/>
                 ))}
               </div>

                   {/* this is the description div */}

               <div className='w-full mt-5  '>
                 <p className='font-semibold pl-2 text-[14px] mb-1 '>Discription:</p>
                 <div className='w-full bg-white px-2 rounded-xl py-1 '>
                   {/*  this is the option div*/}
                   <div className='w-full flex gap-3 '>
                     {[{icon:CiImageOn , text:"Image"} , {icon:IoMdColorFilter, text:"Color"} ,{icon:HiOutlineCodeBracket , text:"Text"} , {icon:FaAlignLeft , text:"Align"} , {icon:CiLink , text:"Link"} ].map((e,i)=>(
                       <Option key={i} icon={e.icon} text={e.text}/>
                     ))}
                   </div>

                   <textarea className='w-full h-[28vh] mt-2 bg-[#f5f5f5] px-2 outline-none rounded-lg' placeholder='type..'></textarea>
                 </div>
               </div>


             </div>
            </div> 
  )
}

export default SettingDetails