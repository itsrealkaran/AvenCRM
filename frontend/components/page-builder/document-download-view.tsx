'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw, Share } from 'lucide-react';

import DocumentDownloadTemplate from '@/components/page-builder/document-download-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DocumentDownloadForm from './update/document-download/page';
interface DocumentDownloadProps {
  navigateTo: (view: string) => void;
}

export default function DocumentDownload({ navigateTo }: DocumentDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [documentSettings, setDocumentSettings] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    setDocumentSettings({
      title: 'Document Resource Center',
      description:
        'Access our comprehensive collection of real estate documents, forms, and templates.',
      bgImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
      buttonText: 'Download Documents',
      accentColor: '#059669',
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

  if (isLoading) {
    return (
      <Card className='flex items-center justify-center min-h-full'>
        <div className='text-center'>
          <div className='inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium mb-4'>
            <span className='relative flex h-2 w-2 mr-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-600'></span>
            </span>
            Loading Documents
          </div>
          <p className='text-muted-foreground'>Please wait while we load your documents...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='min-h-full flex flex-col'>
      <DocumentDownloadForm
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
              <ChevronLeft className='h-5 w-5 text-emerald-600' />
            </Button>
            <h1 className='text-2xl font-bold text-emerald-600'>Document Center</h1>
          </div>
          <div className='space-x-2'>
            <Button onClick={handleShare} variant='outline'>
              <Share className='w-4 h-4 mr-2' />
              Share
            </Button>
            <Button onClick={handleUpdate} className='bg-emerald-600 hover:bg-emerald-700'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update
            </Button>
          </div>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <DocumentDownloadTemplate data={documentSettings} />
          </div>
        </div>
      </main>
    </Card>
  );
}
