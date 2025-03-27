'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Share } from 'lucide-react';

import LocationSearchTemplate from '@/components/page-builder/location-search-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; 

// Sample property data
const properties = [
  {
    id: 1,
    title: 'Modern Luxury Villa',
    address: '123 Oceanview Drive, Malibu, CA',
    price: 2450000,
    beds: 5,
    baths: 4,
    sqft: 3800,
    type: 'For Sale',
    featured: true,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.025922,
    lng: -118.779757,
  },
  {
    id: 2,
    title: 'Downtown Penthouse',
    address: '789 Skyline Ave, Los Angeles, CA',
    price: 1850000,
    beds: 3,
    baths: 3.5,
    sqft: 2200,
    type: 'For Sale',
    featured: false,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.052235,
    lng: -118.243683,
  },
  {
    id: 3,
    title: 'Cozy Family Home',
    address: '456 Maple Street, Pasadena, CA',
    price: 975000,
    beds: 4,
    baths: 2,
    sqft: 2400,
    type: 'For Sale',
    featured: false,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.147785,
    lng: -118.144516,
  },
  {
    id: 4,
    title: 'Beachfront Condo',
    address: '101 Shoreline Blvd, Santa Monica, CA',
    price: 1250000,
    beds: 2,
    baths: 2,
    sqft: 1500,
    type: 'For Sale',
    featured: true,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.009124,
    lng: -118.497886,
  },
  {
    id: 5,
    title: 'Hillside Retreat',
    address: '555 Canyon View, Beverly Hills, CA',
    price: 3750000,
    beds: 6,
    baths: 5.5,
    sqft: 5200,
    type: 'For Sale',
    featured: false,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.07362,
    lng: -118.400352,
  },
  {
    id: 6,
    title: 'Urban Loft',
    address: '222 Arts District, Los Angeles, CA',
    price: 895000,
    beds: 1,
    baths: 2,
    sqft: 1800,
    type: 'For Sale',
    featured: false,
    image: '/placeholder.svg?height=300&width=500',
    lat: 34.040713,
    lng: -118.231476,
  },
];

interface LocationSearchProps {
  navigateTo: (view: string) => void;
}

export default function LocationSearch({ navigateTo }: LocationSearchProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Update the properties object to include the new props
  const [searchSettings, setSearchSettings] = useState({
    title: 'Find Your Dream Home',
    description:
      'Search for properties in your desired location and connect with our expert agents.',
    backgroundImage: '/placeholder.svg?height=800&width=1600',
  });

  // In useEffect, add code to load settings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSearchSettings({
        title: parsedData.locationSearchTitle || searchSettings.title,
        description: parsedData.locationSearchDescription || searchSettings.description,
        backgroundImage: parsedData.locationSearchBackgroundImage || searchSettings.backgroundImage,
      });
    }
  }, []);

  const handleShare = () => {
    // Implement share functionality
    alert('Share functionality to be implemented');
  };

  const handleUpdate = () => {
    // In a real app, this would navigate to a setup page
    alert('Update functionality to be implemented');
  };

  if (isLoading) {
    return (
      <Card className='flex items-center justify-center min-h-full'>
        <div className='text-center'>
          <div className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4'>
            <span className='relative flex h-2 w-2 mr-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-600'></span>
            </span>
            Loading Properties
          </div>
          <p className='text-muted-foreground'>Please wait while we load property listings...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='min-h-full flex flex-col'>
      <header className='bg-white shadow-sm p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='mr-2'
              onClick={() => navigateTo('dashboard')}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h1 className='text-2xl font-bold text-blue-600'>Property Search</h1>
          </div>
          <div className='space-x-2'>
            <Button onClick={handleShare} variant='outline'>
              <Share className='w-4 h-4 mr-2' />
              Share
            </Button>
            <Button onClick={handleUpdate} className='bg-blue-600 hover:bg-blue-700'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update
            </Button>
          </div>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto p-6'>
            <LocationSearchTemplate
              properties={properties}
              title={searchSettings.title}
              description={searchSettings.description}
              backgroundImage={searchSettings.backgroundImage}
            />
          </div>
        </div>
      </main>
    </Card>
  );
}
