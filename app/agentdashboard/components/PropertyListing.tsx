"use client"
import React, { useState } from 'react'
import { BsHeart } from 'react-icons/bs'
import { FaDirections, FaShareAlt } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'
import { GoShareAndroid } from 'react-icons/go'
import { IoIosExpand, IoMdHeartEmpty, IoMdPhotos } from 'react-icons/io'
import { MdOutlineDirectionsCar } from 'react-icons/md'
import { PiBathtub } from 'react-icons/pi'
import { ImCross } from "react-icons/im";


const PropertyListing = () => {

const [openDialog, setopenDialog] = useState(true)
const [openImages , setopenImages] = useState(false)

const changeDialog = () =>{
  setopenDialog(prev=>!prev)
}

const changeimages = () =>{
  setopenImages(prev=>!prev)
}

  return (
    <>
    {openDialog ? (

  
    
               <div onClick={()=>changeDialog()} className='w-[24%] overflow-hidden flex-shrink-0 h-[49%] bg-white rounded-xl'>
               {/* this is the image container */}
               <div className='w-full h-[45%] '>
                 <img className='w-full h-full object-cover ' src="https://images.pexels.com/photos/29139391/pexels-photo-29139391/free-photo-of-dome-of-palacio-de-bellas-artes-in-mexico-city.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="not showing" />
               </div>
       {/* THIS IS THE TEXT CONTAINER */}
               <div className='py-2 px-3'>
                   <h1 className=' font-bold opacity-80 leading-[1.3rem]  uppercase'>92 allium place, orlando fl 32827 </h1>
                   <h2 className='font-bold opacity-90 text-[#4A60A1] text-[15px] leading-none mt-4'>$ 590,693</h2>
       
                   <div className='flex w-full gap-4 pb-3 border-b-[1px] border-black/20 mt-3'>
                     <div className='flex items-center gap-1'>
                       <MdOutlineDirectionsCar/>
                       <h1 className='text-sm'>4</h1>
                     </div>
                     <div className='flex items-center gap-1'>
                       <PiBathtub/>
                       <h1 className='text-sm'>4</h1>
                     </div>
                     <div className='flex items-center gap-1'>
                       <IoIosExpand/>
                       <h1 className='text-sm'>2096.32 ft</h1>
                     </div>
                   </div>
       
                   <div className='flex items-center  mt-2 justify-between'>
                       <div className='flex items-center gap-1'>
                         <div className='w-9 h-9 overflow-hidden rounded-full '>
                           <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/17525263/pexels-photo-17525263/free-photo-of-peach-juice-in-glasses.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="not showing" />
                         </div>
                           <h1 className='font-semibold opacity-70 tracking-tight text-sm'>Jenny Wilson</h1>
                       </div>
       
                       <div className='flex items-center gap-2'>
                         <div className='w-6 h-6 rounded bg-[#EDEFF6] flex items-center justify-center'>
                             <GoShareAndroid/>
                         </div>
                         <div className='w-6 h-6 rounded bg-[#EDEFF6] flex items-center justify-center'>
                             <IoMdHeartEmpty/>
                         </div>
                       </div>
                   </div>
               </div>
             </div>
      ):
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      // this is the second part 💀💀💀 coding like hell 
      
      
      
      <>
          <div className='absolute top-0  overflow-y-auto right-0 w-full h-[89vh] z-10 bg-[#F6F9FE]'>
            {/* this is the center text  */}
                    <div className='w-full text-center uppercase font-bold opacity-80 pt-3'>
                      <h1>92 allium place, orlando fl 32827</h1>
                    </div>
            {/* this is the bento grid for the images  */}
                    <div className='flex px-5 h-[58%]  items-end  mt-5 gap-2 justify-between '>
                      <div className='w-[48%] overflow-hidden  rounded-lg h-full'>
                        <img className='w-full h-full object-cover ' src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                      </div>
                      <div className='w-[53%] flex flex-col gap-2 h-full'>

                        <div className='w-full h-[49%] justify-between flex gap-2'>
                          <div className='w-[49.5%] h-full overflow-hidden rounded-lg'>

                          <img className='w-full h-full overflow-hidden' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                          </div>

                          <div className='w-[49.5%] h-full overflow-hidden rounded-lg'>

                          <img className='w-full h-full overflow-hidden' src="https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                          </div>
                        </div>
                        <div className='w-full h-[49%] justify-between flex gap-2'>
                          <div className='w-[49.5%] h-full overflow-hidden rounded-lg'>

                          <img className='w-full h-full overflow-hidden' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                          </div>

                          <div className='w-[49.5%] h-full overflow-hidden rounded-lg relative'>
                            <div className='w-full h-full absolute top-0 left-0  bg-black/10 flex justify-end items-center '>
                              <div onClick={()=>changeimages()} className='flex gap-2 cursor-pointer text-white px-2 py-2 mr-1 bg-[#363532]/80 rounded-sm'>
                              <IoMdPhotos />
                              <FaPlus />
                              <h1>27</h1>
                              </div>
                            </div>

                          <img className='w-full h-full overflow-hidden' src="https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                          </div>
                        </div>
                      </div>
                    </div>
            {/* this is the pricing and other dets of the thing */}

                    <div className='w-full flex  mt-8 items-center justify-between px-8'>

                      <h1 className='text-[1.8rem] font-extrabold text-[#4A60A1]'>$590,693</h1>

                      <div className='flex gap-3 items-center text-[1.1rem] '>
                        <GoShareAndroid/>
                        <BsHeart/>
                      </div>
                    </div>

                    <div className='flex mt-7 items-end w-full justify-between px-8'>
                            <div className='text-xl font-bold w-[25%] uppercase'>
                              <h1>92 allium place, orlando fl 32872 92 allium place, orlando fl 32872 </h1>
                            </div>

                        
                   <div className='flex  gap-4 pb-3 mt-3'>
                     <div className='flex items-center gap-1'>
                       <MdOutlineDirectionsCar/>
                       <h1 className='text-sm'>4</h1>
                     </div>
                     <div className='flex items-center gap-1'>
                       <PiBathtub/>
                       <h1 className='text-sm'>4</h1>
                     </div>
                     <div className='flex items-center gap-1'>
                       <IoIosExpand/>
                       <h1 className='text-sm'>2096.32 ft</h1>
                     </div>
                   </div>
                    </div>

                    <div className=' w-full h-[100vh] k'></div>                          

          </div>


          <div className={`absolute ${openImages ? "block" : "hidden"} top-0 left-0 w-full h-full z-20 bg-[#F6F9FE]`}>

            <div className='relative w-full h-[10%] text-center pt-5'>
              <h1 className='font-bold uppercase opacity-70'>92 allium place, orlando fl 32872</h1>
            </div>

            <div className='absolute top-5 right-1 flex gap-1'>
                  <div className='p-1'>
                  <FaDirections /> 

                  </div>
                  <div className='p-1'>
                  <FaShareAlt />
                  </div>
                  <div onClick={()=>changeimages()} className='p-1 cursor-pointer'>
                  <ImCross />
                  </div>
            </div>

            <div className='flex w-full h-[90%] justify-between items-end'>
        
            <div className='w-[41%] h-full flex flex-wrap items-start overflow-y-auto justify-start gap-2 p-2'>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
                    <div className='w-[49%] overflow-hidden h-[23%] flex-shrink-0 rounded-lg bg-black'>
                      <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showing" />
                    </div>
              
                   
            </div> 
            <div className='w-[59%] h-full pt-2 px-1 pb-3 '>
              <div className='w-full overflow-hidden  h-full rounded-xl'>

              <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=600" alt="not showign" />
              </div>
              </div> 
              </div>
          </div>
      </>}       
             </>
  )
}

export default PropertyListing