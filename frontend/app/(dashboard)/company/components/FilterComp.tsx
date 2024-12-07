import React from 'react';
import { CiCalendar } from 'react-icons/ci';
import { FaAngleDown } from 'react-icons/fa6';
import { IoIosSearch } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';

interface FilterProps {
  close: () => void;
}

const FilterComp: React.FC<FilterProps> = ({ close }) => {
  return (
    <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end'>
      <div className='w-[400px] bg-white h-full shadow-xl'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>Filters</h2>
              <p className='text-sm text-gray-500'>
                Showing <span className='font-medium'>198</span> from{' '}
                <span className='font-medium'>893</span> results
              </p>
            </div>
            <button
              onClick={close}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <IoClose className='w-5 h-5 text-gray-500' />
            </button>
          </div>
        </div>

        <div className='p-6 space-y-6 overflow-y-auto h-[calc(100%-180px)]'>
          {/* Period Selection */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>Period</label>
            <div className='relative'>
              <input
                type='text'
                placeholder='Select Period'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
              <CiCalendar className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            </div>
          </div>

          {/* Sort Options */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-gray-700'>Sort</h3>
            <div className='space-y-3'>
              {['By due date', 'By user count', 'By amount'].map((option) => (
                <label key={option} className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='text-sm text-gray-700'>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Fields */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Assignees</label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search assignees'
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <IoIosSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Estimate</label>
              <input
                type='text'
                placeholder='Number of employees'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Plan</label>
              <div className='relative'>
                <select className='w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                  <option value=''>Select plan</option>
                  <option value='premium'>Premium</option>
                  <option value='standard'>Standard</option>
                  <option value='basic'>Basic</option>
                </select>
                <FaAngleDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-6'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-500'>10 matches found</span>
            <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComp;
