'use client';

import React, { useState } from 'react';
import { CiFilter } from 'react-icons/ci';
import { FaArrowDown } from 'react-icons/fa6';
import { FiRefreshCw } from 'react-icons/fi';
import { IoIosSearch } from 'react-icons/io';

import { TopNavbar } from '../../agent/components/TopNavbar';
import FilterComp from '../components/FilterComp';
import SideNavBar from '../components/SideNavBar';
import StatsOverview from '../components/StatsOverview';

// company font dec

const Page = () => {
  // one api for the list component

  const [filterOpen, setfilterOpen] = useState(false);
  const [modal, setmodal] = useState(false);

  const filterClose = () => {
    setfilterOpen(false);
  };

  const changeModal = () => {
    setmodal((prev) => !prev);
  };

  return (
    <div className='relative w-full flex h-screen overflow-hidden'>
      <div className='w-full h-screen '>
        <TopNavbar />
        <div className='w-full bg-white h-full  pt-5 mt-3 rounded-xl'>
          {/* this is the same as the payment thingy not making in component though kyu ki bhai time ni hai  */}
          <div className='w-full px-4 flex justify-between items-center'>
            {/* this is the main heading */}
            <div className='text-[1.5rem] font-bold tracking-tight'>Company Stats</div>

            <div className='flex gap-4 text-[1.2rem] opacity-70 '>
              <IoIosSearch />
              <FiRefreshCw />
              <FaArrowDown />
              <div onClick={() => setfilterOpen((prev) => !prev)}>
                <CiFilter />
              </div>
            </div>
          </div>

          {/* the stats contaier */}

          <div className=' px-3 flex flex-col h-full  w-full pt-2'>
            <div className='flex flex-col h-[84%]  pt-5  pb-16 gap-3  overflow-y-auto '>
              {[
                {
                  Cname: 'TATA',
                  date: '2/12/23',
                  empName: 'NikoChan',
                  assignee: 'jhon smith',
                  imgUrl:
                    'https://images.pexels.com/photos/12918397/pexels-photo-12918397.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
                  plan: true,
                },
                {
                  Cname: 'Tesla',
                  date: '3/04/43',
                  empName: 'Arima',
                  assignee: 'Futaro kun',
                  imgUrl:
                    'https://images.pexels.com/photos/3533228/pexels-photo-3533228.png?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Mahindra',
                  date: '5/07/13',
                  empName: 'Soju',
                  assignee: 'Aisha san',
                  imgUrl:
                    'https://images.pexels.com/photos/2061302/pexels-photo-2061302.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: true,
                },
                {
                  Cname: 'Google',
                  date: '1/02/14',
                  empName: 'Horiyima',
                  assignee: 'Kaede san',
                  imgUrl:
                    'https://images.pexels.com/photos/4394807/pexels-photo-4394807.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: true,
                },
                {
                  Cname: 'Microsoft',
                  date: '17/12/14',
                  empName: 'Nanao',
                  assignee: 'Miku san',
                  imgUrl:
                    'https://images.pexels.com/photos/4884417/pexels-photo-4884417.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Obys Agency',
                  date: '24/12/04',
                  empName: 'NIkoChan',
                  assignee: 'Nehal san',
                  imgUrl:
                    'https://images.pexels.com/photos/5477855/pexels-photo-5477855.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: true,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
                {
                  Cname: 'Apple',
                  date: '12/12/04',
                  empName: 'Sachin',
                  assignee: 'Siddhi',
                  imgUrl:
                    'https://images.pexels.com/photos/5014213/pexels-photo-5014213.jpeg?auto=compress&cs=tinysrgb&w=600',
                  plan: false,
                },
              ].map((e, i) => (
                <StatsOverview
                  Cname={e.Cname}
                  date={e.date}
                  empName={e.empName}
                  assignee={e.assignee}
                  imgUrl={e.imgUrl}
                  plan={e.plan}
                  key={i}
                  func={changeModal}
                  open={modal}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {filterOpen ? <FilterComp close={filterClose} /> : <></>}
    </div>
  );
};

export default Page;
