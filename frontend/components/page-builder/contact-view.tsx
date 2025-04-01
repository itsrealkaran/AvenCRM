'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Share, ChevronLeft } from 'lucide-react';

import ContactFormTemplate from '@/components/page-builder/contact-form-template';
import ContactForm from '@/components/page-builder/update/contact/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ContactViewProps {
  navigateTo: (view: string) => void;
}

export default function ContactView({ navigateTo }: ContactViewProps) {
  const [contactData, setContactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setIsLoading(true);
    setContactData({
      title: 'Get in Touch With Our Team',
      subtitle: "We're here to help with all your real estate needs",
      description:
        'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
      bgImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
      buttonText: 'Send Message',
      accentColor: '#4f46e5',
      social: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
      },
    });
    setIsLoading(false);
  };

  const handleShare = () => {
    // Implement share functionality
    toast({
      title: 'Share Feature',
      description: 'Share functionality to be implemented',
    });
  };

  const handleUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card className='flex items-center justify-center min-h-full'>
        <div className='text-center'>
          <div className='inline-flex items-center px-3 py-1 rounded-full text-amber-600 text-sm font-medium mb-4'>
            <span className='relative flex h-2 w-2 mr-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-600 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-600'></span>
            </span>
            Loading Contact Form
          </div>
          <p className='text-muted-foreground'>Please wait while we prepare your contact form...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='h-full flex flex-col'>
      <ContactForm open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen} isLoading={isLoading} />

      <div className='shadow-sm p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='mr-2'
              onClick={() => navigateTo('dashboard')}
            >
              <ChevronLeft className='h-8 w-8 text-amber-600' />
            </Button>
            <h1 className='text-2xl font-bold text-amber-600'>Contact Form</h1>
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
      </div>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <ContactFormTemplate
              bgImage={contactData.bgImage}
              title={contactData.title}
              subtitle={contactData.subtitle}
              description={contactData.description}
              buttonText={contactData.buttonText}
              accentColor={contactData.accentColor}
              social={contactData.social}
            />
          </div>
        </div>
      </main>
    </Card>
  );
}
