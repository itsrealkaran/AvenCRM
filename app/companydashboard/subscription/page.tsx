import React from 'react'
import { FaCheck } from "react-icons/fa";


const page = () => {
  return (
    <div className='w-full p-3 h-full bg-[#F6F9FE]'>
      {/* this is the pricing section  */}
      <div className='w-full h-[50%] rounded-xl justify-between flex'>
        <div className='w-[49.5%] h-full overflow-hidden rounded-xl bg-white flex '>
          {/* this is the right div  */}
          <div className='w-[50%] pt-5  pl-10 h-full  '>
            {/* top level div */}
                  <div className=' flex gap-[17px]'>
                    {/* this is the geometric shape thingy  */}
                    <div className='w-16 h-16 rounded-xl bg-[#ECEBFF] flex items-center justify-center'>
                      <div className='w-10 h-10 rounded-full flex overflow-hidden'>
                          <div className='w-1/2 h-full bg-[#00BDBD]'></div>
                        <div className='w-1/2 h-full bg-[#B8B1FF]'></div>
                      </div>
                    </div>
                      {/* this is the text box of the top level div  */}
                    <div className='leading-[2rem]'>
                        <h1 className='text-[1.3rem] opacity-70'>For individuals</h1>
                        <h2 className='font-bold text-[1.6rem]'>Basic</h2>
                    </div>
                  </div>
                  {/* paragraph text area div */}

                  <div className='text-[1rem] leading-[1.4rem] opacity-70 mt-7'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem, </p>
                  </div>

                  {/* this is the button div */}

                  <div className='flex w-full items-center mt-8'>
                    <div className='w-[40%] h-fit flex items-start gap-5  flex-col'>
                        <div className='bg-[#F7F7FA] rounded-xl px-4 py-1 font-bold'>Status</div>
                        <div className='  font-bold text-[#3FFF9C] px-4'>Active</div>
                    </div>
                    <div className='w-[60%] h-fit flex items-start gap-5    flex-col'>
                    <div className='bg-[#F7F7FA] rounded-xl px-4 py-1 font-bold'>Next Due Date</div>
                        <div className=' pr-4  font-bold text-[#106fff] px-4'>14/05/25</div>
                    </div>
                  </div>

                  {/* this is the pay now div  */}

                  <div className='px-4 w-fit cursor-pointer rounded-lg mt-8 py-2 text-white font-semibold bg-[#5932EA]'>
                            Pay now 
                  </div>
          </div>
          {/* this is the left div */}
          <div className='w-[50%] pt-5 flex flex-col items-center  h-full '>
            {/* ṭhis is the price div  */}
                    <div className='flex items-end gap-1 text-start '>
                      <h1 className='text-[3rem] font-bold h-fit  leading-none '>$99</h1>
                      <h2 className='text-[0.8rem] opacity-70'>/monthly</h2>
                    </div>

                    {/* this is the what's included div  */}

                    <div>
                      <h1 className='text-[0.8rem] mt-5 font-bold '>What&apos;s included</h1>

                      <div className='flex gap-[7px] text-[0.9rem] items-center   mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1 >All Analytics features</h1>
                      </div>
                      <div className='flex gap-[6px] text-[0.9rem] items-center  mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Up to 250,000 tracked visits</h1>
                      </div>
                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Normal supports</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem] items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Up to 3 team members</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>All analytics features</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Normal support</h1>
                      </div>

                    </div>
          </div>
        </div>





        <div className='w-[49.5%] h-full rounded-xl flex bg-white '>


          {/* this is the right div */}
        <div className='w-[50%] pt-5  pl-10 h-full  '>
            {/* top level div */}
                  <div className=' flex gap-[17px]'>
                    {/* this is the geometric shape thingy  */}
                    <div className='w-16 h-16 rounded-xl bg-[#ECEBFF] flex items-center justify-center'>
                      <div className='w-9 h-9 rounded-[2px] flex overflow-hidden'>
                          <div className='w-1/2 h-full bg-[#00BDBD]'></div>
                        <div className='w-1/2 h-full flex flex-col'>
                          <div className='w-full h-1/2 bg-[#B8B1FF]'></div>
                          <div className='w-full h-1/2 bg-[#DCD8FF]'></div>
                        </div>
                      </div>
                    </div>
                      {/* this is the text box of the top level div  */}
                    <div className='leading-[2rem]'>
                        <h1 className='text-[1.3rem] opacity-70'>For Startups</h1>
                        <h2 className='font-bold text-[1.6rem]'>Popular</h2>
                    </div>
                  </div>
                  {/* paragraph text area div */}

                  <div className='text-[1rem] leading-[1.4rem] opacity-70 mt-12'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem, </p>
                  </div>

                  {/* this is the button div */}

               

                  {/* this is the pay now div  */}

                  <div className='flex items-center justify-center w-full cursor-pointer rounded-full mt-10 font-bold py-2 text-black bg-[#ECECEC]'>
                            Get Started 
                  </div>
          </div>
          {/* this is the left div */}
          <div className='w-[50%] pt-5  flex flex-col items-center h-full   '>
            {/* ṭhis is the price div  */}
                    <div className='flex items-end gap-1 '>
                      <h1 className='text-[3rem] font-bold h-fit  leading-none'>$199</h1>
                      <h2 className='text-[0.8rem] opacity-70'>/monthly</h2>
                    </div>

                    {/* this is the what's included div  */}

                    <div>
                      <h1 className='text-[0.8rem] mt-5 font-bold '>What&apos;s included</h1>

                      <div className='flex gap-[7px] text-[0.9rem] items-center   mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1 >All Analytics features</h1>
                      </div>
                      <div className='flex gap-[6px] text-[0.9rem] items-center  mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Up to 1000,000 tracked visits</h1>
                      </div>
                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Premium supports</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem] items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Up to 10 team members</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>All analytics features</h1>
                      </div>

                      <div className='flex gap-[6px] text-[0.9rem]  items-center mt-3'>
                        <div className='w-5 h-5 text-white text-[0.8rem] flex items-center justify-center font-semibold rounded-full bg-black'>
                              <FaCheck/>
                        </div>

                        <h1>Normal support</h1>
                      </div>

                    </div>
          </div>
        </div>
      </div>

    {/* this is the below scrollable list area */}
      <div className='w-full px-2 pt-3 h-[46%] bg-white rounded-xl  mt-2'>
      <div className='flex items-center py-2 px-1 shadow-2xl rounded-lg shadow-white/10'>
        <div className='w-[20%] flex pl-5'>
          <div className='bg-[#F7F7FA] px-5 text-[0.9rem] rounded-lg py-1'>
            Date
          </div>
        </div>

        <div className='w-[20%] flex'>
          <div className='bg-[#F7F7FA] px-5 text-[0.9rem] rounded-lg py-1'>
            Description
          </div>
        </div>

        <div className='w-[20%] flex justify-center'>
          <div className='bg-[#F7F7FA] px-5 text-[0.9rem] rounded-lg py-1'>
            Billing Amount
          </div>
        </div>

        <div className='w-[20%] flex justify-center'>
          <div className='bg-[#F7F7FA] px-5 text-[0.9rem] rounded-lg py-1'>
            Due Date
          </div>
        </div>

        <div className='w-[20%] flex justify-end pr-14'>
          <div className='bg-[#F7F7FA] px-5 text-[0.9rem] rounded-lg py-1'>
            Status
          </div>
        </div>

      </div>

      <div className='flex flex-col flex-nowrap h-[30vh] pb-10 pt-4 gap-3 overflow-y-auto w-full'>

          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
          <div className='w-full flex items-center text-[0.8rem] py-2 rounded-lg font-semibold bg-[#F7F7FA] '>

            <div className='w-[19%] flex pl-10'>
              <h1 className='opacity-80'>Feb 2025</h1>
            </div> 


            <div className='w-[20%] flex '>
              <div className='flex flex-col text-[0.75rem] opacity-80 items-center'>
                <h1>Quaterly true-up</h1>
                <p>july 14,2023 - july 5,2025 </p>
              </div>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center'>
              <h1>Rs 50,00.00</h1>
            </div>

            <div className='w-[20%] opacity-80 flex justify-center '>
              <h1>Feb 14 2025</h1>
            </div>

            <div className='w-[20%] opacity-80 text-red-700 flex justify-center pl-16'>
              <h1>paid</h1>
            </div>

          </div>
       

      </div>

      </div>
    </div>
  )
}

export default page