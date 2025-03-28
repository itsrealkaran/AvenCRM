'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Share } from 'lucide-react';

import DocumentDownloadTemplate from '@/components/page-builder/document-download-template';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Sample document data
const documents = [
  {
    id: 1,
    title: 'Purchase Agreement Template',
    description: 'Standard residential property purchase agreement form',
    category: 'Contracts',
    type: 'PDF',
    size: '245 KB',
    updated: '2023-11-15',
    downloads: 1245,
    featured: true,
  },
  {
    id: 2,
    title: 'Seller Disclosure Statement',
    description: 'Property condition disclosure form for sellers',
    category: 'Disclosures',
    type: 'DOCX',
    size: '180 KB',
    updated: '2023-10-22',
    downloads: 987,
    featured: false,
  },
  {
    id: 3,
    title: "Buyer's Agent Agreement",
    description: 'Exclusive buyer representation agreement',
    category: 'Contracts',
    type: 'PDF',
    size: '210 KB',
    updated: '2023-09-30',
    downloads: 756,
    featured: false,
  },
  {
    id: 4,
    title: 'Home Inspection Checklist',
    description: 'Comprehensive checklist for home inspections',
    category: 'Checklists',
    type: 'PDF',
    size: '320 KB',
    updated: '2023-11-05',
    downloads: 1532,
    featured: true,
  },
  {
    id: 5,
    title: 'Closing Cost Worksheet',
    description: 'Detailed breakdown of closing costs for buyers',
    category: 'Financial',
    type: 'XLSX',
    size: '175 KB',
    updated: '2023-10-18',
    downloads: 892,
    featured: false,
  },
  {
    id: 6,
    title: 'Lead-Based Paint Disclosure',
    description: 'Required disclosure for properties built before 1978',
    category: 'Disclosures',
    type: 'PDF',
    size: '195 KB',
    updated: '2023-09-12',
    downloads: 645,
    featured: false,
  },
  {
    id: 7,
    title: 'Mortgage Application Checklist',
    description: 'Documents needed for mortgage application',
    category: 'Checklists',
    type: 'PDF',
    size: '230 KB',
    updated: '2023-11-10',
    downloads: 1105,
    featured: false,
  },
  {
    id: 8,
    title: 'Property Management Agreement',
    description: 'Contract between property owner and management company',
    category: 'Contracts',
    type: 'DOCX',
    size: '255 KB',
    updated: '2023-10-05',
    downloads: 578,
    featured: false,
  },
];

interface DocumentDownloadProps {
  navigateTo: (view: string) => void;
}

export default function DocumentDownload({ navigateTo }: DocumentDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Update the document settings
  const [documentSettings, setDocumentSettings] = useState({
    title: 'Document Resource Center',
    description:
      'Access our comprehensive collection of real estate documents, forms, and templates.',
  });

  // In useEffect, add code to load settings from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setDocumentSettings({
        title: parsedData.documentTitle || documentSettings.title,
        description: parsedData.documentDescription || documentSettings.description,
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
          <div className='h-[calc(100vh-8rem)] overflow-y-auto p-6'>
            <DocumentDownloadTemplate
              documents={documents}
              title={documentSettings.title}
              description={documentSettings.description}
            />
          </div>
        </div>
      </main>
    </Card>
  );
}
