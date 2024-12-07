import React from 'react'

interface val{
               text:string
}


// it take the width of its parent , if in bigger container its input field will be bigger 

const InputField:React.FC<val> = ({text}) => {
  return (
               <div >
               <p className='uppercase  mt-5 mb-2 tracking-tight font-semibold pl-2 text-[11px] '>{text}:</p>
               <input className='outline-none px-3 py-1 bg-white border rounded-lg w-full' type="text"  />
             </div>
  )
}

export default InputField