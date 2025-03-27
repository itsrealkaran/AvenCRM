'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Share } from 'lucide-react';

import ContactFormTemplate from '@/components/page-builder/contact-form-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ContactProps {
  navigateTo: (view: string) => void;
}

export default function Contact({ navigateTo }: ContactProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Contact information data
  const contactInfo = {
    address: {
      street: '123 Real Estate Blvd, Suite 100',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
    },
    phone: '(213) 555-1234',
    email: 'info@realestate.com',
    hours: {
      weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed',
    },
    social: {
      facebook: 'https://facebook.com/realestate',
      instagram: 'https://instagram.com/realestate',
      linkedin: 'https://linkedin.com/company/realestate',
      twitter: 'https://twitter.com/realestate',
    },
  };

  // Update the contact form settings
  const [contactSettings, setContactSettings] = useState({
    title: 'Get in Touch With Our Team',
    description:
      'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
    backgroundImage: '/placeholder.svg?height=800&width=1600',
  });

  // In useEffect, add code to load settings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setContactSettings({
        title: parsedData.contactFormTitle || contactSettings.title,
        description: parsedData.contactFormDescription || contactSettings.description,
        backgroundImage: parsedData.contactFormBackgroundImage || contactSettings.backgroundImage,
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
          <div className='inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-sm font-medium mb-4'>
            <span className='relative flex h-2 w-2 mr-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-600 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-600'></span>
            </span>
            Loading Contact Form
          </div>
          <p className='text-muted-foreground'>Please wait while we prepare the contact form...</p>
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
            <h1 className='text-2xl font-bold text-amber-600'>Contact Us</h1>
          </div>
          <div className='space-x-2'>
            <Button onClick={handleShare} variant='outline'>
              <Share className='w-4 h-4 mr-2' />
              Share
            </Button>
            <Button onClick={handleUpdate} className='bg-amber-600 hover:bg-amber-700'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update
            </Button>
          </div>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <ContactFormTemplate
              contactInfo={contactInfo}
              title={contactSettings.title}
              description={contactSettings.description}
              backgroundImage={contactSettings.backgroundImage}
            />
          </div>
        </div>
      </main>
    </Card>
  );
}
