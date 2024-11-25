"use client"
import BackGroundImage from '@/app/admindashboard/components/BackGroundImage'
import InnerNav from '@/app/admindashboard/components/InnerNav'
import SettingDetails from '@/app/admindashboard/components/SettingDetails'
import SettingNotification from '@/app/admindashboard/components/SettingNotification'
import SettingPassword from '@/app/admindashboard/components/SettingPassword'
import React from 'react'
import {useState} from "react"



const Page = () => {
const [details, setdetails] = useState(true)
const [password, setpassword] = useState(false)
const [notification, setnotification] = useState(false)

const openDets = () =>{
  setdetails(true)
  setpassword(false)
  setnotification(false)
}
const openpass = () =>{
  setdetails(false)
  setpassword(true)
  setnotification(false)
}
const opennotifi = () =>{
  setdetails(false)
  setpassword(false)
  setnotification(true)
}

  return (
    <div className='w-full  relative  flex bg-[#fafbff]'>

               {/* this is the side navbar  */}


              {/* this is the right div  */}

              <div className='w-full   h-[100vh]  '>
               {/* this is the top navigation section  */}

                          {/* this is the main image section */}
                          <div className='w-full h-[90%] overflow-y-auto'>

                          <div className='w-full h-[35%] flex relative items-center justify-center'>

                            {/* this is the inner div this will be an component  */}

                       <BackGroundImage/>

                          </div>

                          <div className='w-full h-[70%] pt-12 px-10 '>

                            {/* confused that should i make it a component or not well lets make it btw it is the inner nav section that contains the cancel and save button  */}

                                               <InnerNav openSet={details} openPas = {password} opennoti ={notification}  dets={openDets} passw={openpass} notifi={opennotifi}/>
                                        {details&&(

                                          <SettingDetails/>
                                          )
                                        }

                                        {password &&(

                                          <SettingPassword/>
                                        )}
                                        
                                        {notification && (

                                         <SettingNotification/> 
                                        )}
                                        
                                      
                                            
                          </div>  

                          </div>
              </div>
    </div>
  )
}

export default Page
