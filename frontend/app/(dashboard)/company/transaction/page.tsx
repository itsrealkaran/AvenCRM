'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IoDownloadOutline, IoSearch } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { VscRefresh } from 'react-icons/vsc';

import FilterComp from '../components/FilterComp';
import InvoiceOverview from '../components/InvoiceOverview';

const Page = () => {
  const [filteropen, setfilteropen] = useState(false);

  const filterClose = () => setfilteropen(false);

  return (
    <div className='w-full h-screen bg-gray-50'>
      <div className='max-w-[1400px] mx-auto px-6 py-8'>
        {/* Header Section */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Company Invoices</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage and track your company transactions</p>
          </div>

          <div className='flex items-center gap-4'>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <IoSearch className='w-5 h-5 text-gray-600' />
            </button>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <VscRefresh className='w-5 h-5 text-gray-600' />
            </button>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <IoDownloadOutline className='w-5 h-5 text-gray-600' />
            </button>
            <button
              onClick={() => setfilteropen(true)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <LuFilter className='w-5 h-5 text-gray-600' />
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
              <Image
                className='w-full h-full object-contain'
                src='https://cdn.pixabay.com/photo/2015/10/20/21/05/mcdonald-998495_1280.png'
                alt='Company Logo'
                width={100}
                height={100}
              />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>McDonalds</h2>
              <p className='text-sm text-gray-500'>Premium Plan</p>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className='bg-white rounded-xl shadow-sm p-4 mb-4'>
          <div className='grid grid-cols-4 gap-4 px-6'>
            <div className='text-sm font-medium text-gray-700'>Date</div>
            <div className='text-sm font-medium text-gray-700'>Description</div>
            <div className='text-sm font-medium text-gray-700'>Billing Amount</div>
            <div className='text-sm font-medium text-gray-700'>Status</div>
          </div>
        </div>

        {/* Invoices List */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='divide-y divide-gray-200'>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <InvoiceOverview key={i} func={() => {}} open={false} />
            ))}
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      {filteropen && <FilterComp close={filterClose} />}
    </div>
  );
};

export default Page;
