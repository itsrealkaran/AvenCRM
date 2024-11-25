import Image from '@/node_modules/next/image'
import React from 'react'
import img from "../../assets/windowBack.jpg"


const BackGroundImage = () => {
  return (
               <>

               <div className='w-[98%] h-[85%]  rounded-[20px] border overflow-hidden '>

               {/* this is the background image */}
               <Image className='w-full h-full object-cover' src={img} alt="not showing " />

             </div>

             {/* this is the profile photo of the cuties customers karan bhai ke customer has */}

             <div className='w-36 h-36 -bottom-10 left-24 rounded-full bg-white items-center justify-center flex absolute'>
               {/* inner div */}
               <div className='w-[90%] h-[90%] bg-black rounded-full overflow-hidden'>
                 <img className='w-full h-full object-cover' width={100} height={100} src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing " />
               </div>

             </div>
               </>
  )
}

export default BackGroundImage