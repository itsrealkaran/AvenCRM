'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';

import PropertyBox from '../../../../components/PropertyBox';

const Page = () => {
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/property`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setResponse(res.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const PropertySkeleton = () => (
    <div className='bg-gray-100 rounded-lg p-4 w-80 h-[400px] animate-pulse'>
      <div className='w-full h-[200px] bg-gray-200 rounded-md mb-4'></div>
      <div className='space-y-3'>
        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        <div className='flex gap-2'>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/4'></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='relative h-full overflow-y-auto gap-2'>
      <div className='w-full mt-8 flex justify-center items-center'>
        <h2 className='text-center text-xl font-semibold justify-self-center'>
          Properties Listing
        </h2>
        <Link
          href={'/agent/property/add'}
          className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-24'
        >
          Add
        </Link>
        <button className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-2'>
          Delete
        </button>
      </div>
      <div className='flex flex-wrap gap-2 m-6 '>
        {isLoading ? (
          <>
            {[...Array(6)].map((_, index) => (
              <PropertySkeleton key={index} />
            ))}
          </>
        ) : (
          response.map((item: PropertyData) => (
            <PropertyBox
              key={item.id}
              id={item.id}
              imageUrl={item.images[0].imageUrl}
              address={item.address}
              price={item.price}
              landSize={item.sqft}
              bedrooms={item.bedrooms}
              bathrooms={item.bathrooms.partailBathrooms}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
