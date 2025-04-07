'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw, Share } from 'lucide-react';

import Logo from '@/components/logo';
import RealtorPortfolio from '@/components/page-builder/realtor-portfolio';
import SetupForm from '@/components/page-builder/update/portfolio/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PortfolioViewProps {
  navigateTo: (view: string) => void;
}

export default function PortfolioView({ navigateTo }: PortfolioViewProps) {
  const [realtorData, setRealtorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchLandingData();
  }, []);

  const fetchLandingData = async () => {
    setIsLoading(true);
    setRealtorData({
      name: 'Sarah Johnson',
      title: 'Luxury Real Estate Specialist',
      location: 'San Francisco Bay Area, CA',
      image:
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cG9ydHJhaXQlMjBtYW58ZW58MHx8MHx8fDA%3D',
      bio: 'With over 15 years of experience, I specialize in luxury properties and helping clients make informed decisions in the competitive Bay Area market.',
      dealsCount: '350+',
      propertyValue: '$500M+',
      yearsExperience: '15+',
      clientSatisfaction: '98%',
      accentColor: '#7c3aed',
      approach:
        'I believe in personalized service and leveraging the latest technology to ensure my clients get the best deals in the market.',
      expertise: [
        'Luxury Residential Properties',
        'Investment Properties',
        'First-Time Home Buyers',
        'Property Valuation',
      ],
      certifications: [
        'Certified Residential Specialist (CRS)',
        "Accredited Buyer's Representative (ABR)",
        'Luxury Home Marketing Specialist',
        'Certified Negotiation Expert (CNE)',
      ],
      education:
        'Bachelor of Business Administration in Real Estate, University of California, Berkeley',
      phone: '(415) 555-0123',
      email: 'sarah@sarahjohnsonrealty.com',
      officeAddress: '123 Market Street, San Francisco, CA 94105',
      social: {
        facebook: 'https://www.facebook.com/sarahjohnsonrealty',
        instagram: 'https://www.instagram.com/sarahjohnsonrealty',
        linkedin: 'https://www.linkedin.com/company/sarahjohnsonrealty',
        twitter: 'https://www.twitter.com/sarahjohnsonrealty',
      },
    });
    setIsLoading(false);
  };

  const handleShare = () => {
    // Implement share functionality
    alert('Share functionality to be implemented');
  };

  const handleUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  if (isLoading && !realtorData)
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
    <Card className='h-full flex flex-col'>
      <SetupForm
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
              <ChevronLeft className='h-5 w-5 text-primary' />
            </Button>
            <h1 className='text-2xl font-bold text-primary'>Realtor Portfolio</h1>
          </div>
          <div className='space-x-2'>
            <Button onClick={handleShare} variant='outline'>
              <Share className='w-4 h-4 mr-2' />
              Share
            </Button>
            <Button onClick={handleUpdate}>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update
            </Button>
          </div>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <RealtorPortfolio data={realtorData} />
          </div>
        </div>
      </main>
    </Card>
  );
}
