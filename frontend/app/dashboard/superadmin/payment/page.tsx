'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CiFilter } from 'react-icons/ci';
import { FaArrowDown } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';

import FilterComp from '../components/FilterComp';
import InvoiceOverview from '../components/InvoiceOverview';
import SideNavBar from '../components/SideNavBar';
import { TopNavigation } from '../components/TopNavigation';

// one api for the invoices and for its detailed explanatino

const Page = () => {
  const [modal, setmodal] = useState(false);

  const changeModal = () => {
    setmodal((prev) => !prev);
  };

  const [filteropen, setfilteropen] = useState(false);
  const filterClose = () => {
    setfilteropen(false);
  };
  return (
    <div className='w-full relative bg-[#f0f5fc] h-full overflow-hidden flex'>
      <div className='w-full h-full '>
        <div className='w-full h-[90%] flex flex-col px-3'>
          <div className='w-full h-[32%] bg-white rounded-t-xl mt-3 pt-2'>
            {/*  this is teh top filter section */}
            <div className='w-full px-4 flex justify-between items-center'>
              {/* this is the main heading */}
              <div className='text-[1.15rem] font-bold tracking-tight'>Company Invoices</div>

              <div className='flex gap-3 text-[1rem] opacity-70 '>
                <IoIosSearch />
                <FiRefreshCw />
                <FaArrowDown />
                <div onClick={() => setfilteropen((prev) => !prev)}>
                  <CiFilter />
                </div>
              </div>
            </div>

            {/* this is teh company logo section */}

            <div className='w-full text-[0.95rem] mt-10 ml-2 px-4 font-semibold tracking-tight items-center flex gap-3'>
              <div className='w-8 h-8 rounded-lg overflow-hidden  bg-black'>
                <Image
                  className='w-full h-full object-contain'
                  src='https://cdn.pixabay.com/photo/2015/10/20/21/05/mcdonald-998495_1280.png'
                  alt='not showing'
                  width={100}
                  height={100}
                />
              </div>
              <h1>McDonalds</h1>
            </div>

            {/* this is the list thingy section wierd */}

            <div className='w-full h-[30%]  mt-7 px-3'>
              <div className='w-full flex px-10 items-center justify-between bg-[#f5f5f5] rounded-xl py-[11px] mt-8'>
                <div className=' bg-[#E2E2E2] rounded-xl font-semibold text-[0.8rem]  px-8 py-[5px]'>
                  <h1 className=' opacity-80'>Date</h1>
                </div>
                <div className=' bg-[#E2E2E2] rounded-xl font-semibold text-[0.8rem]  px-8 py-[5px]'>
                  <h1 className=' opacity-80'>Description</h1>
                </div>
                <div className=' bg-[#E2E2E2] rounded-xl font-semibold text-[0.8rem]  px-8 py-[5px]'>
                  <h1 className=' opacity-80'>Billing Amount</h1>
                </div>
                <div className=' bg-[#E2E2E2] rounded-xl font-semibold text-[0.8rem]  px-8 py-[5px]'>
                  <h1 className=' opacity-80'>Status</h1>
                </div>
              </div>
            </div>

            {/* this is the final thingy of this page  */}
          </div>
          <div className='w-full h-[65%]    bg-white  overflow-hidden flex flex-col whitespace-nowrap gap-2  px-3'>
            <div className='overflow-y-auto pt-3 flex flex-col gap-3 mb-8  '>
              {[1, 2, 4, 5, 6, 7, 7, 8, 9].map((e, i) => (
                <InvoiceOverview func={changeModal} open={modal} key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {filteropen ? <FilterComp close={filterClose} /> : <></>}
    </div>
  );
};

export default Page;