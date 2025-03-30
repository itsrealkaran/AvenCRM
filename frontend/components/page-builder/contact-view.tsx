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

  const [contactSettings, setContactSettings] = useState({
    bgImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1973&q=80',
    title: 'Get in Touch',
    subtitle: "Let's find your dream home together",
    description:
      "Ready to start your real estate journey? I'm here to help you every step of the way.",
    buttonText: 'Send Message',
    color: '#D97706',
    social: {
      facebook: 'https://facebook.com/realestate',
      instagram: 'https://instagram.com/realestate',
      linkedin: 'https://linkedin.com/company/realestate',
      twitter: 'https://twitter.com/realestate',
    },
  });

  // In useEffect, add code to load settings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setContactSettings({
        title: parsedData.contactFormTitle || contactSettings.title,
        subtitle: parsedData.contactFormSubtitle || contactSettings.subtitle,
        description: parsedData.contactFormDescription || contactSettings.description,
        buttonText: parsedData.contactFormButtonText || contactSettings.buttonText,
        bgImage: parsedData.contactFormBgImage || contactSettings.bgImage,
        social: parsedData.contactFormSocial || contactSettings.social,
        color: parsedData.contactFormColor || contactSettings.color,
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
              title={contactSettings.title}
              subtitle={contactSettings.subtitle}
              description={contactSettings.description}
              buttonText={contactSettings.buttonText}
              bgImage={contactSettings.bgImage}
              social={contactSettings.social}
              accentColor={contactSettings.color}
            />
          </div>
        </div>
      </main>
    </Card>
  );
}
