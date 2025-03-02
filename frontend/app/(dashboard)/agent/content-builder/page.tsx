'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

function ContentBuilderPage() {
  const router = useRouter();
  return (
    <div className='flex-1 h-screen overflow-y-auto space-y-4 p-4 md:p-6 rounded-xl z-20 shadow-lg bg-white'>
      <h3 className='text-2xl font-bold text-center'>Content Templates</h3>
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
              router.push('/agent/content-builder/create');
            }}
          >
            <div className='w-52 h-52 border-2 border-dashed border-black/60 rounded-md flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-12 h-12'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4.5v15m7.5-7.5h-15'
                />
              </svg>
            </div>
            <div className='flex gap-2 mt-4'>
              <Button className='w-full'>Create New</Button>
            </div>
          </div>

          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/blog-template.png'}
              alt='Blog template'
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md object-cover'
            />
            <div className='flex gap-2 mt-4'>
              <Button>Use Template</Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>

          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/newsletter-template.png'}
              alt='Newsletter template'
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md object-cover'
            />
            <div className='flex gap-2 mt-4'>
              <Button>Use Template</Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>

          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/social-template.png'}
              alt='Social media template'
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md object-cover'
            />
            <div className='flex gap-2 mt-4'>
              <Button>Use Template</Button>
              <Button variant="outline">Preview</Button>
            </div>
          </div>

          <div className='w-fit h-fit p-4 bg-zinc-200 rounded-md flex-shrink-0'>
            <Image
              src={'/listing-template.png'}
              alt='Property listing template'
              width={100}
              height={100}
              className='w-52 h-52 border-2 border-black/60 rounded-md object-cover'
            />
            <div className='flex gap-2 mt-4'>
              <Button>Use Template</Button>
              <Button variant="outline">Preview</Button>
            </div>
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

      <h3 className='text-2xl font-bold mt-8'>Recent Content</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='p-4 bg-white border rounded-lg shadow-sm'>
          <h4 className='font-semibold text-lg'>Spring Market Update</h4>
          <p className='text-gray-500 text-sm mt-1'>Blog post • Created 3 days ago</p>
          <div className='mt-4 flex justify-between'>
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Share</Button>
          </div>
        </div>
        
        <div className='p-4 bg-white border rounded-lg shadow-sm'>
          <h4 className='font-semibold text-lg'>Monthly Newsletter</h4>
          <p className='text-gray-500 text-sm mt-1'>Email • Created 1 week ago</p>
          <div className='mt-4 flex justify-between'>
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Share</Button>
          </div>
        </div>
        
        <div className='p-4 bg-white border rounded-lg shadow-sm'>
          <h4 className='font-semibold text-lg'>New Listing Announcement</h4>
          <p className='text-gray-500 text-sm mt-1'>Social post • Created 2 weeks ago</p>
          <div className='mt-4 flex justify-between'>
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Share</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentBuilderPage; 