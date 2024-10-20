import React from 'react'

interface val { 
        dets : ()=>void;
        passw: ()=>void;
        notifi : ()=>void;

        openSet:boolean
        openPas:boolean
        opennoti:boolean
}

const InnerNav:React.FC<val> = ({dets , passw , notifi , openPas , openSet , opennoti}) => {
  return (
               <div className='w-full  flex items-center justify-between  h-[10%]'>
               {/*this is the toggel navigation section   */}
               <div className='w-1/2 font-semibold text-[14px]  flex gap-6 items-center '>
                <div onClick={()=>dets()}>
                 <h1  className={`${openSet?"font-semibold" : "font-semibold opacity-70"}`}>My details</h1>
                </div>
                <div onClick={()=>passw()}>
                 <h1 className={`${openPas?"font-semibold":"font-semibold opacity-70"}`}>Password</h1>
                </div>
                <div onClick={()=>notifi()}>
                 <h1 className={`${opennoti ? "font-semibold" :"font-semibold opacity-70"}`}>Notifications</h1>
                </div>
               </div>

               {/* this is the button section */}
               <div className='w-1/2 flex items-center font-semibold gap-5 justify-end'>
                       <div className='py-[3px] px-4 border rounded-lg'>
                               Cancle
                       </div>
                       <div className='py-[3px] bg-[#5051f9] text-white px-4 border  rounded-lg'>
                               save
                       </div>
               </div>


 </div>
  )
}

export default InnerNav