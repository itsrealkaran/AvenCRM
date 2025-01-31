'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

function MarketingPage() {
  const router = useRouter();
  return (
    <div className='flex-1 h-screen overflow-y-auto space-y-4 p-4 md:p-6 rounded-xl z-20 shadow-lg bg-white'>
      <h3 className='text-2xl font-bold text-center'>Template</h3>
      <div className='relative'>
        <button
          onClick={() => document.getElementById('scroll-container')?.scrollBy(-200, 0)}
          className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
          </svg>
        </button>
        <div
          id='scroll-container'
          className='flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-8'
        >
          <div
            className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'
            onClick={() => {
              router.push('/agent/marketing/add');
            }}
          >
            <Image
              src={'/template1.png'}
              alt='not showing '
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md'
            />
          </div>
          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/template1.png'}
              alt='not showing '
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md'
            />
          </div>
          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/template1.png'}
              alt='not showing '
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md'
            />
          </div>
          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/template1.png'}
              alt='not showing '
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md'
            />
          </div>
          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/template1.png'}
              alt='not showing '
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md'
            />
          </div>
        </div>
        <button
          onClick={() => document.getElementById('scroll-container')?.scrollBy(200, 0)}
          className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='w-6 h-6'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
          </svg>
        </button>
      </div>

      {/* My Templates */}

      <h2 className='text-2xl font-bold text-center'>My Templates</h2>
      <div className='flex flex-wrap gap-4 px-8'>
        <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
          <Image
            src={'/template1.png'}
            alt='not showing '
            width={100}
            height={100}
            className='w-52 h-52 border-2 border-black/60 rounded-md'
          />
          <div className='flex gap-2 mt-4'>
            <Button>Share</Button>
            <Button>Edit</Button>
          </div>
        </div>
        <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
          <Image
            src={'/template1.png'}
            alt='not showing '
            width={100}
            height={100}
            className='w-52 h-52 border-2 border-black/60 rounded-md'
          />
          <div className='flex gap-2 mt-4'>
            <Button>Share</Button>
            <Button>Edit</Button>
          </div>
        </div>
        <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
          <Image
            src={'/template1.png'}
            alt='not showing '
            width={100}
            height={100}
            className='w-52 h-52 border-2 border-black/60 rounded-md'
          />
          <div className='flex gap-2 mt-4'>
            <Button>Share</Button>
            <Button>Edit</Button>
          </div>
        </div>
        <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
          <Image
            src={'/template1.png'}
            alt='not showing '
            width={100}
            height={100}
            className='w-52 h-52 border-2 border-black/60 rounded-md'
          />
          <div className='flex gap-2 mt-4'>
            <Button>Share</Button>
            <Button>Edit</Button>
          </div>
        </div>
        <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
          <Image
            src={'/template1.png'}
            alt='not showing '
            width={100}
            height={100}
            className='w-52 h-52 border-black/60 rounded-md'
          />
          <div className='flex gap-2 mt-4'>
            <Button>Share</Button>
            <Button>Edit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketingPage;
