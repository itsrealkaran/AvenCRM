'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Share } from 'lucide-react';

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
      bio: 'With over 15 years of experience, I specialize in luxury properties and helping clients make informed decisions in the competitive Bay Area market.',
      dealsCount: '350+',
      propertyValue: '$500M+',
      yearsExperience: '15+',
      clientSatisfaction: '98%',
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
      officeLocation: '123 Market Street, San Francisco, CA 94105',
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

  if (isLoading) {
    return (
      <Card className='flex items-center justify-center min-h-full'>
        <div className='text-center'>
          <div className='inline-flex items-center px-3 py-1 rounded-full text-primary text-sm font-medium mb-4'>
            <span className='relative flex h-2 w-2 mr-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
            </span>
            Loading Portfolio
          </div>
          <p className='text-muted-foreground'>Please wait while we prepare your portfolio...</p>
        </div>
      </Card>
    );
  }

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
              <ArrowLeft className='h-5 w-5' />
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
            <RealtorPortfolio realtorData={realtorData} />
          </div>
        </div>
      </main>
    </Card>
  );
}
