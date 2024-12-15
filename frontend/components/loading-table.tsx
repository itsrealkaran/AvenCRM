import React from 'react';

import { Skeleton } from './ui/skeleton';

function LoadingTableSkeleton() {
  return (
    <div className='flex flex-col w-full items-center justify-center pt-20'>
      {/* Skeleton Table Header */}
      <div className='flex space-x-4 p-4 bg-gray-100 rounded-md'>
        <Skeleton className='h-6 w-[150px]' />
        <Skeleton className='h-6 w-[200px]' />
        <Skeleton className='h-6 w-[100px]' />
        <Skeleton className='h-6 w-[150px]' />
        <Skeleton className='h-6 w-[150px]' />
        <Skeleton className='h-6 w-[150px]' />
        <Skeleton className='h-6 w-[150px]' />
      </div>

      {/* Skeleton Table Rows */}
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className='flex space-x-4 p-4 bg-gray-100 rounded-md'>
          <Skeleton className='h-6 w-[150px]' />
          <Skeleton className='h-6 w-[200px]' />
          <Skeleton className='h-6 w-[100px]' />
          <Skeleton className='h-6 w-[150px]' />
          <Skeleton className='h-6 w-[150px]' />
          <Skeleton className='h-6 w-[150px]' />
          <Skeleton className='h-6 w-[150px]' />
        </div>
      ))}
    </div>
  );
}

export default LoadingTableSkeleton;
