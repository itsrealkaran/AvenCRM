'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Building2, Download, FileText, Mail, Phone, Search } from 'lucide-react';

import Logo from '@/components/logo';
import ContactFormTemplate from '@/components/page-builder/contact-form-template';
import DocumentDownloadTemplate from '@/components/page-builder/document-download-template';
import LocationSearchTemplate from '@/components/page-builder/location-search-template';
import { api } from '@/lib/api';

export default function DynamicPage({ params }: { params: { slug: string } }) {
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/page-builder/pages/${params.slug}`);
        setPageData(response.data);
      } catch (err: any) {
        console.error('Error fetching page data:', err);
        setError(err?.response?.data?.message || 'Failed to load page data');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchPageData();
    }
  }, [params.slug]);

  if (isLoading)
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
          <p className='text-lg font-medium text-gray-900'>Loading Property</p>
          <p className='text-sm text-gray-500'>Please wait while we fetch the details...</p>
        </div>
      </div>
    );

  if (error || !pageData) {
    return notFound();
  }

  // Render the appropriate template based on the page type
  const renderTemplate = () => {
    switch (pageData.type) {
      case 'contact':
        return <ContactFormTemplate data={pageData} />;
      case 'location-search':
        return <LocationSearchTemplate data={pageData} />;
      case 'document-download':
        return <DocumentDownloadTemplate data={pageData} />;
      default:
        return (
          <div className='flex flex-col items-center justify-center h-screen'>
            <div className='flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6'>
              <FileText className='w-12 h-12 text-red-500' />
            </div>
            <h1 className='text-2xl font-bold text-center mb-2'>Unknown Template Type</h1>
            <p className='text-gray-600 text-center max-w-md'>
              The template type "{pageData.type}" is not supported.
            </p>
          </div>
        );
    }
  };

  return <div className='min-h-screen bg-white'>{renderTemplate()}</div>;
}
