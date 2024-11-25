import React from 'react'
import {useState} from "react"

const SettingNotification = () => {
               const [button1, setbutton1] = useState(false)
               const openbutton1 = () =>{
                 setbutton1(prev =>!prev)
               }
               const [button2, setbutton2] = useState(false)
               const openbutton2 = () =>{
                 setbutton2(prev =>!prev)
               }
               const [button3, setbutton3] = useState(false)
               const openbutton3 = () =>{
                 setbutton3(prev =>!prev)
               }
  return (
               <div className='w-full h-[80%] flex flex-col gap-4 mt-10 '>

               <div className='flex px-10 items-center justify-between py-2 bg-[#f5f5f5] rounded-xl'>

                 <div>
                 <p className='font-semibold   text-[0.9rem]'>Issue Activity</p>
                 <p className='text-[13px] opacity-50 font-semibold'>Send me email notification for every crash report</p>
                 </div>

                 <div onClick={()=>(
                     openbutton1()
                 )} className={`w-[4.5%] h-7 flex items-center ${button1?"justify-end bg-blue-400":"justify-start bg-black/20" }  px-1  transition-all rounded-full`}>
                   <div  className={`w-5 h-5 rounded-full bg-white`}></div>
                 </div>


               </div>
               <div className='flex px-10 items-center justify-between py-2 bg-[#f5f5f5] rounded-xl'>

                 <div>
                 <p className='font-semibold   text-[0.9rem]'>Tracking Activity</p>
                 <p className='text-[13px] opacity-50 font-semibold'>Send me email notification when someone&apos;ve mailed me</p>
                 </div>

                 <div onClick={()=>(
                     openbutton2()
                 )} className={`w-[4.5%] h-7 flex items-center ${button2?"justify-end bg-blue-400":"justify-start bg-black/20" }  px-1  transition-all rounded-full`}>
                   <div  className={`w-5 h-5 rounded-full bg-white`}></div>
                 </div>


               </div>
               <div className='flex px-10 items-center justify-between py-2 bg-[#f5f5f5] rounded-xl'>

                 <div>
                 <p className='font-semibold  text-[0.9rem]'>New Comments</p>
                 <p className='text-[13px] opacity-50 font-semibold'>Send me email notification when someone&apos;ve sent the comment</p>
                 </div>

                 <div onClick={()=>(
                     openbutton3()
                 )} className={`w-[4.5%] h-7 flex items-center ${button3?"justify-end bg-blue-400":"justify-start bg-black/20" }  px-1  transition-all rounded-full`}>
                   <div  className={`w-5 h-5 rounded-full bg-white`}></div>
                 </div>


               </div>

                   <div className='w-full flex px-1 mt-4 items-center gap-2'>
                     <input className='w-10 h-5' type="checkbox"  />
                     <p className='opacity-70 text-[15px]'>Don&apos;t send me notification after 9:00 PM</p>
                   </div>
             </div>

  )
}

export default SettingNotification