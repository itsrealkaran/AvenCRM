'use client';

import React from 'react';
import { FaCheck } from 'react-icons/fa';

const Page = () => {
  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Pricing Cards */}
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Basic Plan */}
        <div className='overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md'>
          <div className='flex'>
            {/* Plan Details */}
            <div className='flex-1 p-8'>
              <div className='flex items-start gap-4'>
                <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50'>
                  <div className='h-8 w-8 overflow-hidden rounded-full'>
                    <div className='flex h-full w-full'>
                      <div className='h-full w-1/2 bg-teal-400'></div>
                      <div className='h-full w-1/2 bg-indigo-400'></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>For individuals</p>
                  <h2 className='mt-1 text-2xl font-semibold text-gray-900'>Basic</h2>
                </div>
              </div>

              <p className='mt-4 text-gray-600'>
                Perfect for individuals and small teams getting started with our platform.
              </p>

              <div className='mt-6 grid grid-cols-2 gap-4'>
                <div>
                  <div className='rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700'>
                    Status
                  </div>
                  <div className='mt-2 px-4 text-sm font-medium text-emerald-600'>Active</div>
                </div>
                <div>
                  <div className='rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700'>
                    Next Due Date
                  </div>
                  <div className='mt-2 px-4 text-sm font-medium text-blue-600'>14/05/25</div>
                </div>
              </div>

              <button className='mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700'>
                Pay now
              </button>
            </div>

            {/* Plan Features */}
            <div className='flex-1 border-l border-gray-100 p-8'>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl font-bold text-gray-900'>$99</span>
                <span className='text-sm text-gray-600'>/monthly</span>
              </div>

              <div className='mt-6'>
                <h3 className='font-semibold text-gray-900'>What&apos;s included</h3>
                <ul className='mt-4 space-y-3'>
                  {[
                    'All Analytics features',
                    'Up to 250,000 tracked visits',
                    'Normal support',
                    'Up to 3 team members',
                    'All analytics features',
                    'Normal support',
                  ].map((feature, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white'>
                        <FaCheck />
                      </div>
                      <span className='text-sm text-gray-600'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Plan */}
        <div className='overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md'>
          <div className='flex'>
            {/* Plan Details */}
            <div className='flex-1 p-8'>
              <div className='flex items-start gap-4'>
                <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50'>
                  <div className='h-8 w-8 overflow-hidden rounded-lg'>
                    <div className='flex h-full w-full'>
                      <div className='h-full w-1/2 bg-teal-400'></div>
                      <div className='flex h-full w-1/2 flex-col'>
                        <div className='h-1/2 w-full bg-indigo-400'></div>
                        <div className='h-1/2 w-full bg-indigo-200'></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>For Startups</p>
                  <h2 className='mt-1 text-2xl font-semibold text-gray-900'>Popular</h2>
                </div>
              </div>

              <p className='mt-4 text-gray-600'>
                Ideal for growing businesses that need more power and features.
              </p>

              <button className='mt-16 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-200'>
                Get Started
              </button>
            </div>

            {/* Plan Features */}
            <div className='flex-1 border-l border-gray-100 p-8'>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl font-bold text-gray-900'>$199</span>
                <span className='text-sm text-gray-600'>/monthly</span>
              </div>

              <div className='mt-6'>
                <h3 className='font-semibold text-gray-900'>What&apos;s included</h3>
                <ul className='mt-4 space-y-3'>
                  {[
                    'All Analytics features',
                    'Up to 1,000,000 tracked visits',
                    'Premium support',
                    'Up to 10 team members',
                    'All analytics features',
                    'Priority support',
                  ].map((feature, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white'>
                        <FaCheck />
                      </div>
                      <span className='text-sm text-gray-600'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className='rounded-2xl bg-white p-6 shadow-sm'>
        <h3 className='mb-6 text-lg font-semibold text-gray-900'>Transaction History</h3>

        <div className='mb-4 grid grid-cols-5 gap-4 px-4 text-sm font-medium text-gray-700'>
          <div className='rounded-lg bg-gray-50 px-4 py-2'>Date</div>
          <div className='rounded-lg bg-gray-50 px-4 py-2'>Description</div>
          <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Billing Amount</div>
          <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Due Date</div>
          <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Status</div>
        </div>

        <div className='max-h-[400px] space-y-2 overflow-y-auto'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className='grid grid-cols-5 gap-4 rounded-lg px-4 py-3 transition hover:bg-gray-50'
            >
              <div className='text-sm text-gray-600'>Feb 2025</div>
              <div className='text-sm'>
                <p className='font-medium text-gray-900'>Quarterly true-up</p>
                <p className='text-xs text-gray-600'>July 14, 2023 - July 5, 2025</p>
              </div>
              <div className='text-center text-sm font-medium text-gray-900'>₹5,000.00</div>
              <div className='text-center text-sm text-gray-600'>Feb 14, 2025</div>
              <div className='text-center text-sm font-medium text-emerald-600'>Paid</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
