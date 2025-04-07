'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw, Share } from 'lucide-react';

import LocationSearchTemplate from '@/components/page-builder/location-search-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LocationSearchForm from './update/location-search/page';
import Logo from '../logo';

interface LocationSearchProps {
  navigateTo: (view: string) => void;
}

export default function LocationSearch({ navigateTo }: LocationSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchSettings, setSearchSettings] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setSearchSettings({
      bgImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
      title: 'Find Your Dream Home',
      subtitle:
        'Search for properties in your desired location and connect with our expert agents.',
      description:
        'Our comprehensive property search platform allows you to explore a wide range of residential and commercial properties in your desired location. Whether you\'re looking for a cozy apartment, a spacious family home, or an investment opportunity, our database is regularly updated with the latest listings. Connect with our expert agents who have in-depth knowledge of local markets and can guide you through every step of the buying, selling, or renting process. We\'re committed to helping you find the perfect property that meets all your requirements and fits within your budget.',
      searchPlaceholder: 'Search for properties in your desired location',
      buttonText: 'Search',
      accentColor: '#2563eb',
      agentName: 'John Doe',
      agentTitle: 'Real Estate Agent',
      agentImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
      contactInfo: {
        address: '123 Main St, Anytown, USA',
        phone: '123-456-7890',
        email: 'john.doe@example.com',
      },
      social: {
        facebook: 'https://www.facebook.com/john.doe',
        instagram: 'https://www.instagram.com/john.doe',
        linkedin: 'https://www.linkedin.com/in/john.doe',
        twitter: 'https://www.twitter.com/john.doe',
      },
    });
    setIsLoading(false);
  }, []);

  const handleShare = () => {
    // Implement share functionality
    alert('Share functionality to be implemented');
  };

  const handleUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  if (isLoading && !searchSettings)
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-[#fafbff]'>
        <div className='relative w-32 h-32'>
          <div className='absolute inset-0 border-4 border-primary/30 rounded-full'></div>
          <div className='absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          <div className='absolute text-[4rem] inset-2 flex items-center justify-center'>
            <Logo />
          </div>
        </div>
        <div className='mt-6 space-y-2 text-center'>
          <p className='text-lg font-medium text-gray-900'>Loading Page</p>
          <p className='text-sm text-gray-500'>Please wait while we fetch the details...</p>
        </div>
      </div>
    );

  return (
    <Card className='min-h-full flex flex-col'>
      <LocationSearchForm
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        isLoading={isLoading}
      />
      <header className='bg-white shadow-sm p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='mr-2'
              onClick={() => navigateTo('dashboard')}
            >
              <ChevronLeft className='h-5 w-5 text-blue-600' />
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
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <LocationSearchTemplate data={searchSettings} />
          </div>
        </div>
      </main>
    </Card>
  );
}
