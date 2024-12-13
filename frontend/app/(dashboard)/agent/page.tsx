'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';

import PropertyBox from '../../../components/PropertyBox';
import houseImg from "../../../public/house.webp"

import PropertyListing from './components/PropertyListing';

const page = () => {
  const tempImg = ""
  return (
    <div className='w-full h-full relative justify-between overflow-y-auto flex flex-wrap gap-2'>
      <div className="w-full mt-8 flex justify-center items-center">
        <h2 className="text-center text-lg justify-self-center">Properties Listing</h2>
        <button className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-24'>Add</button>
        <button className='bg-violet-600 text-white p-2 px-4 rounded-md absolute right-2'>Delete</button>
      </div>
      <div className='flex flex-wrap gap-2 m-6 '>
        <PropertyBox img={houseImg} title="Property the property" prise="prise" landSize="landSize" bedrooms="bedrooms" bathrooms="bathrooms" agentName='alex' />
        <PropertyBox img={houseImg} title="title" prise="prise" landSize="landSize" bedrooms="bedrooms" bathrooms="bathrooms" agentName='alex' />
        <PropertyBox img={houseImg} title="title" prise="prise" landSize="landSize" bedrooms="bedrooms" bathrooms="bathrooms" agentName='alex' />
        <PropertyBox img={houseImg} title="title" prise="prise" landSize="landSize" bedrooms="bedrooms" bathrooms="bathrooms" agentName='alex' />
        <PropertyBox img={houseImg} title="title" prise="prise" landSize="landSize" bedrooms="bedrooms" bathrooms="bathrooms" agentName='alex' />

      </div>
    </div>
  );
};

export default Page;
