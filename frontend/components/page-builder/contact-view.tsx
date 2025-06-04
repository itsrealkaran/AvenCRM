'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, RefreshCw, Share, Trash2 } from 'lucide-react';

import ContactFormTemplate from '@/components/page-builder/contact-form-template';
import ContactForm from '@/components/page-builder/update/contact/page';
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

import Logo from '../logo';

interface ContactViewProps {
  navigateTo: (view: string, pageId?: string) => void;
  pageId?: string;
}

export default function ContactView({ navigateTo, pageId }: ContactViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Debug log to check pageId
  useEffect(() => {
    console.log('ContactView pageId:', pageId);
  }, [pageId]);

  // Fetch page data if pageId is provided
  const {
    data: pageData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => {
      console.log('Fetching contact page with ID:', pageId);
      return pageId ? pageBuilderApi.getPage(pageId) : null;
    },
    enabled: !!pageId,
  });

  // Default contact form data
  const defaultData = {
    title: 'Get in Touch With Our Team',
    subtitle: "We're here to help with all your real estate needs",
    description:
      'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
    bgImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
    buttonText: 'Send Message',
    accentColor: '#D97706',
    agentName: 'John Doe',
    officeAddress: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
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
      console.log('Fetched contact page data:', pageData);
    }
  }, [pageData]);

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: () => pageBuilderApi.deletePage(pageId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: 'Contact page deleted',
        description: 'Your contact page has been deleted successfully.',
      });
      navigateTo('dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete contact page. Please try again.',
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
        title: 'Contact page published',
        description: 'Your contact page is now publicly available.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to publish contact page. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle share/publish action
  const handleShare = () => {
    if (!pageData?.data?.slug) {
      toast({
        title: 'Cannot share',
        description: 'Please save your contact page first before sharing.',
        variant: 'destructive',
      });
      return;
    }

    if (!pageData?.data?.isPublic) {
      publishPage.mutate();
    } else {
      // Copy the URL to clipboard
      const url = `${window.location.origin}/p/${pageData?.data?.slug}`;
      navigator.clipboard.writeText(url).then(
        () => {
          toast({
            title: 'Link copied',
            description: 'Contact page link copied to clipboard!',
          });
        },
        (err) => {
          toast({
            title: 'Failed to copy',
            description: 'Could not copy the link to clipboard.',
            variant: 'destructive',
          });
        }
      );
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
        description: 'Please save your contact page first before previewing.',
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
      <ContactForm
        pageId={pageId}
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        navigateTo={navigateTo}
        isLoading={isLoading}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your contact page.
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
              <ChevronLeft className='h-5 w-5 text-amber-600' />
            </Button>
            <h1 className='text-2xl font-bold text-amber-600'>Contact Form</h1>
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
            <Button onClick={handleUpdate} className='bg-amber-600 hover:bg-amber-700'>
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
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500'></div>
              </div>
            ) : (
              <ContactFormTemplate data={pageData?.data?.jsonData || defaultData} />
            )}
          </div>
        </div>
      </main>
    </Card>
  );
}
