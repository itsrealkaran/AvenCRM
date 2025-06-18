'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, RefreshCw, Share, Trash2 } from 'lucide-react';

import RealtorPortfolio from '@/components/page-builder/realtor-portfolio';
import SetupForm from '@/components/page-builder/update/portfolio/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pageBuilderApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PortfolioViewProps {
  navigateTo: (view: string) => void;
  pageId?: string;
}

export default function PortfolioView({ navigateTo, pageId }: PortfolioViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Debug log to check pageId
  useEffect(() => {
    console.log('PortfolioView pageId:', pageId);
  }, [pageId]);

  // Fetch page data if pageId is provided
  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => {
      console.log('Fetching page with ID:', pageId);
      return pageId ? pageBuilderApi.getPage(pageId) : null;
    },
    enabled: !!pageId,
  });

  // Default portfolio data
  const defaultData = {
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
    templateType: 'PORTFOLIO',
  };

  // Effect to open setup form automatically if no pageId is provided
  useEffect(() => {
    if (!pageId && !isUpdateModalOpen) {
      setIsUpdateModalOpen(true);
    }
  }, [pageId, isUpdateModalOpen]);

  // Debugging: log page data when it changes
  useEffect(() => {
    if (pageData) {
      console.log('Fetched page data:', pageData);
    }
  }, [pageData]);

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: () => pageBuilderApi.deletePage(pageId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Portfolio deleted',
        description: 'Your portfolio page has been deleted successfully.',
      });
      navigateTo('dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Publish page mutation
  const publishPage = useMutation({
    mutationFn: () => pageBuilderApi.publishPage(pageId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Portfolio published',
        description: 'Your portfolio is now publicly available.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish portfolio. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle share/publish action
  const handleShare = () => {
    if (!pageData?.data?.slug) {
      toast({
        title: 'Cannot share',
        description: 'Please save your portfolio first before sharing.',
        variant: 'destructive',
      });
      return;
    }

    if (!pageData?.data?.isPublic) {
      publishPage.mutate();
    } else {
      // Copy the URL to clipboard
      const url = `${window.location.origin}/p/${pageData?.data?.slug}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Portfolio URL has been copied to clipboard.',
      });
    }
  };

  // Handle update action
  const handleUpdate = () => {
    setIsUpdateModalOpen(true);
  };

  // Handle delete action
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle preview action
  const handlePreview = () => {
    if (pageData?.data?.slug) {
      window.open(`/p/${pageData.data.slug}`, '_blank');
    } else {
      toast({
        title: 'Cannot preview',
        description: 'Please save your portfolio first before previewing.',
        variant: 'destructive',
      });
    }
  };

  // Handle confirmation of delete
  const confirmDelete = () => {
    deletePage.mutate();
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className='flex flex-col'>
      <SetupForm
        pageId={pageId}
        navigateTo={navigateTo}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        isLoading={isLoading}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your portfolio page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {pageId && (
              <>
                <Button onClick={handlePreview} variant='outline'>
                  <ExternalLink className='w-4 h-4 mr-2' />
                  Preview
                </Button>
                <Button
                  onClick={handleDelete}
                  variant='outline'
                  className='text-red-600 border-red-200 hover:bg-red-50'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete
                </Button>
              </>
            )}
            <Button onClick={handleShare} variant='outline'>
              <Share className='w-4 h-4 mr-2' />
              {pageData?.data?.isPublic ? 'Copy Link' : 'Publish'}
            </Button>
            <Button onClick={handleUpdate}>
              <RefreshCw className='w-4 h-4 mr-2' />
              {pageId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </header>

      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
              </div>
            ) : (
              <RealtorPortfolio data={pageData?.data?.jsonData || defaultData} />
            )}
          </div>
        </div>
      </main>
    </Card>
  );
}
