'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, FileText, Mail, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { pageBuilderApi } from '@/lib/api';

interface DashboardProps {
  navigateTo: (view: string, pageId?: string) => void;
}

export default function Dashboard({ navigateTo }: DashboardProps) {
  // Use React Query to fetch pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => pageBuilderApi.getPages(),
  });

  // Initialize page map for quick lookup
  const pageMap: Record<string, any> = {
    PORTFOLIO: null,
    LOCATION: null,
    DOCUMENT: null,
    CONTACT: null,
  };

  // Populate page map if data is available
  if (pages?.data) {
    pages.data.forEach((page: any) => {
      if (page.templateType) {
        pageMap[page.templateType] = page;
      }
    });
  }

  // Debug to verify page IDs are available
  useEffect(() => {
    if (pages?.data) {
      console.log('Pages loaded:', pages.data);
      console.log('Page map:', pageMap);
    }
  }, [pages?.data]);

  // Function to handle navigation with proper page ID
  const handleNavigate = (view: string, templateType: string) => {
    const page = pageMap[templateType];
    console.log(`Navigating to ${view} with page:`, page?.id);
    navigateTo(view, page?.id);
  };

  return (
    <Card className='min-h-full w-full p-6'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold'>Real Estate Templates</h1>
            <p className='text-sm text-muted-foreground'>
              Create and manage your real estate website pages
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Property Portfolio Card */}
          <Card className='overflow-hidden border border-border hover:border-primary/20 transition-all duration-200'>
            <CardHeader className='p-0'>
              <div className='h-36 bg-gradient-to-r from-primary/10 to-purple-500/10 flex items-center justify-center'>
                <Building className='h-14 w-14 text-primary' />
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              <CardTitle className='text-lg font-semibold mb-1.5'>Property Portfolio</CardTitle>
              <CardDescription className='mb-3 line-clamp-2'>
                Showcase your property listings with an elegant portfolio layout
              </CardDescription>
              <p className='text-sm text-muted-foreground mb-4 line-clamp-3'>
                Perfect for real estate agents looking to highlight their property listings with
                high-quality images and detailed information.
              </p>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>
                  {isLoading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : pageMap.PORTFOLIO ? (
                    'Page created'
                  ) : (
                    'No page created'
                  )}
                </span>
                <Button
                  className='mt-auto'
                  size='sm'
                  onClick={() => handleNavigate('portfolio', 'PORTFOLIO')}
                >
                  {pageMap.PORTFOLIO ? 'View Page' : 'Create Page'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Location Search Card */}
          <Card className='overflow-hidden border border-border hover:border-blue-500/20 transition-all duration-200'>
            <CardHeader className='p-0'>
              <div className='h-36 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 flex items-center justify-center'>
                <MapPin className='h-14 w-14 text-blue-500' />
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              <CardTitle className='text-lg font-semibold mb-1.5'>Location Search</CardTitle>
              <CardDescription className='mb-3 line-clamp-2'>
                Help clients find properties in their desired locations
              </CardDescription>
              <p className='text-sm text-muted-foreground mb-4 line-clamp-3'>
                Interactive map-based search that allows clients to explore properties by
                neighborhood, city, or region with filtering options.
              </p>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>
                  {isLoading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : pageMap.LOCATION ? (
                    'Page created'
                  ) : (
                    'No page created'
                  )}
                </span>
                <Button
                  className='mt-auto'
                  size='sm'
                  onClick={() => handleNavigate('location-search', 'LOCATION')}
                >
                  {pageMap.LOCATION ? 'View Page' : 'Create Page'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document Download Card */}
          <Card className='overflow-hidden border border-border hover:border-emerald-500/20 transition-all duration-200'>
            <CardHeader className='p-0'>
              <div className='h-36 bg-gradient-to-r from-emerald-500/10 to-green-500/10 flex items-center justify-center'>
                <FileText className='h-14 w-14 text-emerald-600' />
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              <CardTitle className='text-lg font-semibold mb-1.5'>Document Download</CardTitle>
              <CardDescription className='mb-3 line-clamp-2'>
                Provide valuable resources for your clients
              </CardDescription>
              <p className='text-sm text-muted-foreground mb-4 line-clamp-3'>
                Offer downloadable guides, market reports, and legal documents to establish your
                expertise and provide value to potential clients.
              </p>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>
                  {isLoading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : pageMap.DOCUMENT ? (
                    'Page created'
                  ) : (
                    'No page created'
                  )}
                </span>
                <Button
                  className='mt-auto'
                  size='sm'
                  onClick={() => handleNavigate('document-download', 'DOCUMENT')}
                >
                  {pageMap.DOCUMENT ? 'View Page' : 'Create Page'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form Card */}
          <Card className='overflow-hidden border border-border hover:border-amber-500/20 transition-all duration-200'>
            <CardHeader className='p-0'>
              <div className='h-36 bg-gradient-to-r from-amber-500/10 to-orange-500/10 flex items-center justify-center'>
                <Mail className='h-14 w-14 text-amber-600' />
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-5'>
              <CardTitle className='text-lg font-semibold mb-1.5'>Contact Form</CardTitle>
              <CardDescription className='mb-3 line-clamp-2'>
                Connect with potential clients easily
              </CardDescription>
              <p className='text-sm text-muted-foreground mb-4 line-clamp-3'>
                Professional contact form with lead capture capabilities to help you grow your
                client base and respond to inquiries promptly.
              </p>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>
                  {isLoading ? (
                    <Skeleton className='h-4 w-20' />
                  ) : pageMap.CONTACT ? (
                    'Page created'
                  ) : (
                    'No page created'
                  )}
                </span>
                <Button
                  className='mt-auto'
                  size='sm'
                  onClick={() => handleNavigate('contact', 'CONTACT')}
                >
                  {pageMap.CONTACT ? 'View Page' : 'Create Page'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
