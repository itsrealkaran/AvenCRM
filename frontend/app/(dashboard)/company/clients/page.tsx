'use client';

import React, { useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { VscRefresh } from 'react-icons/vsc';

import MonitoringLeadList from '../components/MonitoringLeadList';
import MonitoringList from '../components/MonitoringList';

// single component
// in deals just 4 parameter ,

const Page = () => {
  const [deal, setdeal] = useState(false);

  const opendeal = () => {
    setdeal(true);
  };
  const closedeal = () => {
    setdeal(false);
  };

  const bakaData = [1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 8, 8];

  return (
    <div className='h-full w-full overflow-hidden bg-[#F6F9FE] px-3'>
      <div className='mt-3 w-full bg-white'>
        <div className='flex w-full items-center justify-between px-4 pt-5'>
          {/* this is the main heading */}
          <div className='flex items-center gap-3'>
            <div
              onClick={() => closedeal()}
              className={` ${deal ? 'bg-[#979797]' : 'bg-[#5932EA]'} rounded-[4px] px-4 py-[5px] text-sm tracking-tight text-white`}
            >
              <button>Leads</button>
            </div>
            <div
              onClick={() => opendeal()}
              className={`${deal ? 'bg-[#5932EA]' : 'bg-[#979797]'} rounded-[4px] px-4 py-[5px] text-sm tracking-tight text-white`}
            >
              <button>Deals</button>
            </div>
          </div>

          <div className='flex items-center gap-4 text-[1rem]'>
            <div className='flex gap-4 text-lg opacity-70'>
              <IoIosSearch />
              <VscRefresh />
              <IoDownloadOutline />
            </div>
            <div className='opacity-70'>
              <LuFilter />
            </div>
          </div>
        </div>

        <div className='mt-10 flex w-full items-center justify-between pb-5 pl-14 pr-0 text-sm'>
          {deal ? (
            <>
              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Name </h1>
                </div>
              </div>

              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Status</h1>
                </div>
              </div>

              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Deal Value</h1>
                </div>
              </div>

              <div className='flex w-[14%] justify-center pr-5'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Email</h1>
                </div>
              </div>

              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Expected close date</h1>
                </div>
              </div>

              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>close probability</h1>
                </div>
              </div>

              <div className='w-[14%]'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Forcast value</h1>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='flex w-[25%] justify-center'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Name </h1>
                </div>
              </div>
              <div className='flex w-[25%] justify-center'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Status </h1>
                </div>
              </div>
              <div className='flex w-[25%] justify-center'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Phone </h1>
                </div>
              </div>
              <div className='flex w-[25%] justify-center'>
                <div className='w-fit rounded-lg bg-[#F7F7FA] px-4 py-[5px] text-[0.8rem] font-semibold'>
                  <h1 className='opacity-80'>Email </h1>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className='mt-2 flex h-[70vh] w-full flex-col gap-3 overflow-y-auto bg-white px-3 py-5 pb-10'>
        {/* this is going to be the monitorignList comp  */}

        {deal
          ? bakaData.map((e, i) => <MonitoringList key={i} />)
          : bakaData.map((e, i) => <MonitoringLeadList key={i} />)}
      </div>
    </div>
  );
};

export default Page;
