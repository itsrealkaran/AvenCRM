import React from 'react'

interface val{
  func:()=>void
  open:boolean
}

const InvoiceOverview:React.FC<val> = ({func,open}) => {
  return (
    <>
               <div onClick={func} className='flex cursor-pointer flex-shrink-0 items-center text-[0.8rem] justify-between px-16 py-2  bg-[#f5f5f5] rounded-xl'>
               <div className='font-semibold'>
                              <h1 >Feb 2, 2023</h1>
               </div>

               <div className='font-semibold text-center'>
                              <h1>Quaterly true-up</h1>
                              <p className='text-[9px] opacity-60 leading-[1.1rem]'>july 14,2023 - july 5,2024</p>
               </div>
               <div className='font-semibold'>
                              <h1>Rs 50,000.00</h1>
               </div>
               <div className='font-semibold text-center'>
                              <h1>paid</h1>
                              <p className='text-[12px] opacity-90 leading-[1.1rem] text-blue-600'>view Invoice</p>
               </div>
</div>
{open ? (

  <div className='absolute top-0 left-0 w-full h-screen bg-white'>
  <button onClick={func}>go back</button>
</div>
  ):<></>}
</>
  )
}

export default InvoiceOverview