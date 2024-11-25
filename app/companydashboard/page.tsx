"use client"

import React, { useState } from 'react'
import { IoIosSearch, IoMdPerson } from 'react-icons/io'
import { MdEmail, MdOutlineDriveFileRenameOutline, MdOutlineLocalPhone } from "react-icons/md";
import { IoClose, IoDownloadOutline } from 'react-icons/io5'


import ManageUserList from './components/ManageUserList'
import { VscRefresh } from 'react-icons/vsc'
import { LuFilter } from 'react-icons/lu'
import { BsGenderNeuter } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa6';



const Page = () => {
  const [adduser, setadd] = useState(false)

  const openadd = ()=>{
    setadd(prev=>!prev)
  }
  
  const bakaData = [1,2,4,5,6,7,9,0,6,4,3]

  return (
    <div className='w-full h-[100vh] relative overflow-hidden p-3 bg-[#F6F9FE]  '>

      {/* this is the top most div with the filter options  */}
      <div className='bg-white w-full'>
        {/* this is the top level filter div  */}
          <div className='w-full px-4 flex justify-between  items-center pt-5'>
                                                                           {/* this is the main heading */}
                                                                           <div className='text-[1rem] font-bold tracking-tight opacity-90'>Manage Users</div>

                                                                           <div className='flex gap-4 text-[1rem] items-center  '>

                                                                            <div onClick={()=>openadd()} className='bg-[#5932EA] text-white px-2 text-sm py-1  tracking-tight rounded-[4px] '>
                                                                              <button>Add Users</button>
                                                                            </div>
                                                                            <div className='flex gap-4 opacity-70'>

                                                                           <IoIosSearch/>
                                                                           <VscRefresh/>
                                                                           <IoDownloadOutline/>
                                                                            </div>
                                                                           <div >

                                                                           <LuFilter/>
                                                                           </div>
                                                                           </div>


          </div>

          {/* this is the option designation div  */}

            <div className='w-full flex justify-between pl-28  pr-16 pb-5 items-center   mt-10 text-sm'>
            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  px-8 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Designated person</h1>
            </div>
            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  px-8 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Email</h1>
            </div>
            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  px-8 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>Phone</h1>
            </div>
            <div className=' bg-[#F7F7FA] rounded-lg font-semibold text-[0.8rem]  px-8 py-[5px]'>
                                                                                                         <h1 className=' opacity-80'>User Status</h1>
            </div>

            </div>

    </div>

    {/* this is the bottom scrollabel div with the list thingy don't */}

    <div className='bg-white px-3 mt-3 font-semibold overflow-y-auto text-sm flex h-[80vh] py-5  flex-col gap-2'>

      {/* this is going to be an component  */}

      {bakaData.map((e,i)=>(

        <ManageUserList key={i}/>
        
        
        ))}
        
 

    </div>

        {adduser ? (
          
        <div className='absolute top-0 right-0 w-full h-full bg-blue-500/30 backdrop-blur-sm flex items-start pt-10 justify-center'>

                  {/* this is the internal div  */}

                  <div className='w-[40%] pr-10 pl-14 py-10 h-[80%] bg-white rounded-lg'>
                    {/* this is the close button div */}
                    <div onClick={()=>openadd()} className='w-full cursor-pointer text-[1.5rem] opacity-80 flex items-center justify-end'>
                      <IoClose/>
                    </div>
                {/* this is the main heading text  */}
                    <div className='w-full mt-5 font-semibold tracking-tight text-[1.1rem] opacity-80 '>
                          <h1>Create Users</h1>
                    </div>

                    {/* this is the option div */}

                    <div className='w-full flex flex-col gap-3 mt-5 border-b-[1px] border-black/20 pb-8'>
                      {/* this is one text field  */}
                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-1 items-center'>
<MdOutlineDriveFileRenameOutline />
                          <div ></div>
                          <h1>Name</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                          <input className='w-full h-full bg-black/10 rounded-md font-semibold px-3 outline-none' type="text" name="" id="" />
                        </div>

                      </div>

                    {/* this is for the age section */}
                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-2 items-center'>
                          <div> <IoMdPerson/></div>
                          <h1>Age</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                          <input className='w-full h-full bg-black/10 rounded-md font-semibold px-3 outline-none' type="text" name="" id="" />
                        </div>

                      </div>

                      {/* this for the gender  */}
                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-1 items-center'>
                          <div> <BsGenderNeuter /></div>
                          <h1>Gender</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                          <input className='w-full h-full bg-black/10 rounded-md font-semibold px-3 outline-none' type="text" name="" id="" />
                        </div>

                      </div>

                      {/* this is for the phone */}

                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-2 items-center'>
                          <div> <MdOutlineLocalPhone/></div>
                          <h1>Phone</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                          <input className='w-full h-full bg-black/10 rounded-md font-semibold px-3 outline-none' type="text" name="" id="" />
                        </div>

                      </div>


                      {/* this is for the email  */}

                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-2 items-center'>
                          <div> <MdEmail/></div>
                          <h1>Email</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                          <input className='w-full h-full bg-black/10 rounded-md font-semibold px-3 outline-none' type="text" name="" id="" />
                        </div>

                      </div>

                      {/* this is the for the user status  */}

                      
                      <div className='w-full flex items-center justify-between gap-2'>
                        {/* this is the name and the symbol div  */}
                        <div className='flex gap-2 items-center'>
                          <div> <FaUser/></div>
                          <h1>User Status</h1>
                        </div>

                        {/* this is the input box field */}

                        <div className='w-[68%]  h-10 flex items-center '>
                        <select className='w-full h-full text-black/50 bg-black/10 rounded-md font-semibold px-3 outline-none ' name="cars" id="cars">
    <option value="volvo">Active</option>
    <option value="saab">Not Active</option>
    <option value="opel">Active</option>
    <option value="audi">Premium</option>
  </select>
                        </div>

                      </div>

                    </div>

                    {/* this is the last cancel button or add div button  */}

                    <div className='w-full flex tracking-tighter text-sm mt-5 items-center justify-end gap-2'>
                      <div  onClick={()=>openadd()} className='px-3 cursor-pointer py-1 border rounded-sm'>Cancel</div>
                      <div className='px-3 py-1 cursor-pointer bg-[#5932EA] text-white rounded-sm'>Add</div>
                    </div>
                  </div>
        </div>
        ):<></>}

    </div>
  )
}

export default Page