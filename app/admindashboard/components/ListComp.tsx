import React from 'react'

interface val { 
  name:string,
  username:string,
  date:string, 
  status:boolean,
  id:string
}

const ListComp:React.FC<val> = ({name, username , id ,date , status}) => {
  return (
               <div className='w-full h-[17%] flex-shrink-0 bg-[#f5f5f5] flex px-16 items-center justify-between   rounded-lg'>
               {/* logo with the name */}
               <div className='flex gap-4 items-center font-semibold text-[1.3rem] tracking-tight capitalize'>
                              <div className='w-8 h-8 rounded-lg overflow-hidden'>
                                             <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/258083/pexels-photo-258083.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing " />
                              </div>

                              <h1 className='opacity-70 text-[0.9rem]'>{name}</h1>
               </div>

               <div className='opacity-60 text-[0.86rem]'>
                              <p>{date}</p>
               </div>

               <div className='opacity-60 uppercase text-[0.85rem]'>
                              <p>{id}</p>
               </div>

               <div className='flex gap-2 items-center font-semibold text-[1rem] tracking-tight capitalize'>
                              <div className='w-8 h-8 rounded-full overflow-hidden'>
                                             <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/258083/pexels-photo-258083.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing " />
                              </div>

                              <h1 className='opacity-60 text-[0.85rem]'>{username}</h1>
               </div>

               <div className='opacity-80   text-[1rem]'>
                                {status?(

                                  <p className='text-red-700 pr-3'>done!</p>
                                  ):(
                                    <p className='text-blue-700'>Pending</p>
                                    
                                  )}
               </div>
</div>
  )
}

export default ListComp