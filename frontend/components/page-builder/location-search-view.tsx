'use client';

import { useEffect, useState } from 'react';
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
import { pageBuilderApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import LocationSearchForm from './update/location-search/page';

interface LocationSearchViewProps {
  navigateTo: (view: string) => void;
  pageId?: string;
}

export default function LocationSearchView({ navigateTo, pageId }: LocationSearchViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Debug log to check pageId
  useEffect(() => {
    console.log('LocationSearchView pageId:', pageId);
  }, [pageId]);

  // Fetch page data if pageId is provided
  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => {
      console.log('Fetching location page with ID:', pageId);
      return pageId ? pageBuilderApi.getPage(pageId) : null;
    },
    enabled: !!pageId,
  });

  // Default location search data
  const defaultData = {
    title: 'Find Your Dream Property',
    subtitle: 'Search properties by location, features, and price range',
    description:
      'Our interactive map helps you discover available properties in your desired neighborhoods.',
    regions: [
      {
        name: 'Downtown',
        description: 'Urban living in the heart of the city with modern condos and lofts.',
        properties: '45',
        priceRange: '$350k - $1.2M',
        image:
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        location: { lat: 37.7749, lng: -122.4194 },
      },
      {
        name: 'Suburbia',
        description:
          'Family-friendly neighborhoods with excellent schools and community amenities.',
        properties: '78',
        priceRange: '$450k - $950k',
        image:
          'https://images.unsplash.com/photo-1625602812206-5ec545ca1231?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        location: { lat: 37.7749, lng: -122.2194 },
      },
      {
        name: 'Waterfront',
        description: 'Luxury properties with stunning water views and premium amenities.',
        properties: '23',
        priceRange: '$750k - $3.5M',
        image:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        location: { lat: 37.8049, lng: -122.4194 },
      },
      {
        name: 'Countryside',
        description: 'Spacious properties with large lots and rural charm just outside the city.',
        properties: '32',
        priceRange: '$400k - $1.1M',
        image:
          'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        location: { lat: 37.7249, lng: -122.4594 },
      },
    ],
    accentColor: '#3b82f6',
    mapZoom: 10,
    mapCenter: { lat: 37.7749, lng: -122.4194 },
    searchPlaceholder: 'Enter a city, neighborhood, or address',
    contactInfo: {
      name: 'Sarah Johnson',
      phone: '(415) 555-0123',
      email: 'info@realestate.com',
    },
    filters: {
      price: true,
      bedrooms: true,
      propertyType: true,
      squareFeet: true,
    },
    callToAction: 'Contact us to schedule a viewing',
    templateType: 'LOCATION',
  };

  // Effect to open setup form automatically if no pageId is provided
  useEffect(() => {
    if (!pageId && !isUpdateModalOpen) {
      setIsUpdateModalOpen(true);
    }
  }, [pageId, isUpdateModalOpen]);

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: () => pageBuilderApi.deletePage(pageId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Location page deleted',
        description: 'Your location search page has been deleted successfully.',
      });
      navigateTo('dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete location page. Please try again.',
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
        title: 'Location page published',
        description: 'Your location search page is now publicly available.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish location page. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle share/publish action
  const handleShare = () => {
    if (!pageId) {
      toast({
        title: 'Cannot share',
        description: 'Please create your location page first before sharing.',
        variant: 'destructive',
      });
      return;
    }

    if (!pageData?.data?.slug) {
      toast({
        title: 'Cannot share',
        description: 'Please save your location page first before sharing.',
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
        description: 'Location page URL has been copied to clipboard.',
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
        description: 'Please save your location page first before previewing.',
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
      <LocationSearchForm
        pageId={pageId}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        isLoading={isLoading}
        navigateTo={navigateTo}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your location search page.
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
              <ChevronLeft className='h-5 w-5 text-blue-500' />
            </Button>
            <h1 className='text-2xl font-bold text-blue-500'>Location Search</h1>
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
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
              </div>
            ) : (
              <LocationSearchTemplate data={pageData?.data?.jsonData || defaultData} />
            )}
          </div>
        </div>
      </main>
    </Card>
  );
}
