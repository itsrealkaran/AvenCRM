'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';
import { toast } from 'sonner';

import LoadingTableSkeleton from '@/components/loading-table';
import PropertyBox from '@/components/PropertyBox';

const Page = () => {
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const fetchData = async () => {
      setLoading(true);
      toast.loading('Fetching Properties');
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/property`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Properties Fetched');
        setResponse(res.data);
        console.log(res.data);
      } catch (error) {
        toast.error('Error fetching properties');
      } finally {
        toast.dismiss();
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingTableSkeleton />;
  }

  return (
    <div className='w-full h-full relative overflow-y-auto gap-2'>
      <div className='w-full mt-8 flex justify-center items-center'>
        <h2 className='text-center text-lg justify-self-center'>Properties Listing</h2>
        <Link
          href={'/agent/add'}
          className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-24'
        >
          Add
        </Link>
        <button className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-2'>
          Delete
        </button>
      </div>
      <div className='flex flex-wrap gap-2 m-6 '>
        {response.map((item: PropertyData) => (
          <PropertyBox
            key={item.id}
            imgurl={item.imageUrl}
            address={item.address}
            price={item.price}
            landSize={item.sqft}
            bedrooms={item.bedrooms}
            bathrooms={item.bathrooms.partailBathrooms}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
