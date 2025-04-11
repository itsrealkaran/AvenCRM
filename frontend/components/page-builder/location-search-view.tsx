'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, RefreshCw, Share, Trash2 } from 'lucide-react';

import LocationSearchTemplate from '@/components/page-builder/location-search-template';
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
import { api, pageBuilderApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import LocationSearchForm from './update/location-search/page';

interface LocationSearchProps {
  navigateTo: (view: string) => void;
  pageId?: string;
}

export default function LocationSearch({ navigateTo, pageId }: LocationSearchProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch page data if pageId is provided
  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? pageBuilderApi.getPage(pageId) : null),
    enabled: !!pageId,
  });

  // Create default data if no pageId is provided
  const defaultData = {
    title: 'Find Your Dream Home',
    subtitle: 'Search for properties in your desired location and connect with our expert agents.',
    description:
      'Our comprehensive property search platform allows you to explore a wide range of properties.',
    bgImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    buttonText: 'Submit',
    accentColor: '#2563eb',
    searchPlaceholder: 'Enter your desired location',
    templateType: 'LOCATION',
    agentName: 'John Doe',
    agentTitle: 'Real Estate Agent',
    agentImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    contactInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '123-456-7890',
      email: 'john.doe@example.com',
    },
    social: {
      facebook: 'https://www.facebook.com/',
      instagram: 'https://www.instagram.com/',
      linkedin: 'https://www.linkedin.com/',
      twitter: 'https://www.twitter.com/',
    },
    isPublic: false,
  };

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: () => pageBuilderApi.deletePage(pageId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Page deleted',
        description: 'Your page has been deleted successfully.',
      });
      navigateTo('dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete page. Please try again.',
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
        title: 'Page published',
        description: 'Your page is now publicly available.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish page. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle share action
  const handleShare = () => {
    if (!pageData?.data?.slug) {
      toast({
        title: 'Cannot share',
        description: 'Please save your page first before sharing.',
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
        description: 'Page URL has been copied to clipboard.',
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
        description: 'Please save your page first before previewing.',
        variant: 'destructive',
      });
    }
  };

  // Handle confirmation of delete
  const confirmDelete = () => {
    deletePage.mutate();
    setIsDeleteDialogOpen(false);
  };

  // Handle form submission from modal
  const handleFormSubmission = () => {
    queryClient.invalidateQueries({ queryKey: ['page', pageId] });
    queryClient.invalidateQueries({ queryKey: ['pages'] });
    setIsUpdateModalOpen(false);
  };

  return (
    <Card className='min-h-full flex flex-col'>
      <LocationSearchForm
        pageId={pageId}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        isLoading={isLoading}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your page.
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
              <ChevronLeft className='h-5 w-5 text-blue-600' />
            </Button>
            <h1 className='text-2xl font-bold text-blue-600'>
              {pageData?.data?.title || 'Property Search'}
            </h1>
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
            <Button onClick={handleUpdate} className='bg-blue-600 hover:bg-blue-700'>
              <RefreshCw className='w-4 h-4 mr-2' />
              {pageId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </header>
      <main className='flex-grow container mx-auto p-4'>
        <div className='bg-gray-100 rounded-lg overflow-hidden shadow-inner'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto'>
            <LocationSearchTemplate data={pageData?.data?.jsonData || defaultData} />
          </div>
        </div>
      </main>
    </Card>
  );
}
