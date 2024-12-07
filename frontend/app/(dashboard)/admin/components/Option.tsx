import React from 'react'

interface val {
               icon:React.ComponentType,
               text:string
}

const Option:React.FC<val> = ({icon:Icon , text}) => {
  return (
               <div className='py-1 px-2 bg-[#f5f5f5] rounded-lg text-[1rem] items-center flex gap-2'>
               <Icon/>
               <p className='text-xs'>{text}</p>
         </div>
  )
}

export default Option