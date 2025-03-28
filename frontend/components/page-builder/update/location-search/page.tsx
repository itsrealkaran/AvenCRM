'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon, Save, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface SetupFormProps {
  navigateTo: (view: string) => void;
}

export default function UpdateLocationSearch({ navigateTo }: SetupFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    locationSearchTitle: 'Find Your Dream Home',
    locationSearchDescription:
      'Search for properties in your desired location and connect with our expert agents.',
    locationSearchBackgroundImage: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData({
        locationSearchTitle: parsedData.locationSearchTitle || formData.locationSearchTitle,
        locationSearchDescription:
          parsedData.locationSearchDescription || formData.locationSearchDescription,
        locationSearchBackgroundImage:
          parsedData.locationSearchBackgroundImage || formData.locationSearchBackgroundImage,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      // Get existing data
      const existingData = localStorage.getItem('realtorData');
      const parsedData = existingData ? JSON.parse(existingData) : {};

      // Update only the location search fields
      const updatedData = {
        ...parsedData,
        locationSearchTitle: formData.locationSearchTitle,
        locationSearchDescription: formData.locationSearchDescription,
        locationSearchBackgroundImage: formData.locationSearchBackgroundImage,
      };

      // Save back to localStorage
      localStorage.setItem('realtorData', JSON.stringify(updatedData));

      setIsSaving(false);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handlePreview = () => {
    router.push('/location-search/preview');
  };

  return (
    <div className='container mx-auto py-10 px-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='mr-2'
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'>
              Update Location Search Page
            </h1>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handlePreview}>
              Preview
            </Button>
          </div>
        </div>

        <Tabs defaultValue='content' className='w-full'>
          <TabsList className='grid grid-cols-2 mb-8'>
            <TabsTrigger value='content' className='flex items-center gap-1'>
              <Type className='h-4 w-4' /> Content
            </TabsTrigger>
            <TabsTrigger value='appearance' className='flex items-center gap-1'>
              <ImageIcon className='h-4 w-4' /> Appearance
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <Card className='border-none shadow-xl mb-6'>
              <CardHeader>
                <CardTitle className='text-xl'>Page Settings</CardTitle>
              </CardHeader>

              <CardContent>
                <TabsContent value='content' className='space-y-6 mt-0'>
                  <div className='space-y-2'>
                    <Label htmlFor='locationSearchTitle'>Page Title</Label>
                    <Input
                      id='locationSearchTitle'
                      name='locationSearchTitle'
                      value={formData.locationSearchTitle}
                      onChange={handleChange}
                      placeholder='e.g. Find Your Dream Home'
                      required
                    />
                    <p className='text-xs text-muted-foreground'>
                      This title appears at the top of your location search page.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='locationSearchDescription'>Page Description</Label>
                    <Textarea
                      id='locationSearchDescription'
                      name='locationSearchDescription'
                      value={formData.locationSearchDescription}
                      onChange={handleChange}
                      placeholder='e.g. Search for properties in your desired location...'
                      rows={4}
                      required
                    />
                    <p className='text-xs text-muted-foreground'>
                      This description appears below the title and helps explain the purpose of the
                      page.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value='appearance' className='space-y-6 mt-0'>
                  <div className='space-y-2'>
                    <Label htmlFor='locationSearchBackgroundImage'>Background Image URL</Label>
                    <Input
                      id='locationSearchBackgroundImage'
                      name='locationSearchBackgroundImage'
                      value={formData.locationSearchBackgroundImage}
                      onChange={handleChange}
                      placeholder='e.g. https://example.com/background-image.jpg'
                    />
                    <p className='text-xs text-muted-foreground'>
                      This image will be used as the background for the hero section. Leave empty to
                      use the default image.
                    </p>
                  </div>

                  {formData.locationSearchBackgroundImage && (
                    <div className='border rounded-md p-4'>
                      <p className='text-sm font-medium mb-2'>Background Image Preview</p>
                      <div className='aspect-video relative rounded-md overflow-hidden bg-gray-100'>
                        <img
                          src={formData.locationSearchBackgroundImage || '/placeholder.svg'}
                          alt='Background preview'
                          className='object-cover w-full h-full'
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg?height=400&width=600';
                            e.currentTarget.classList.add('border', 'border-red-300');
                          }}
                        />
                      </div>
                      <p className='text-xs text-muted-foreground mt-2'>
                        For best results, use a high-resolution image (at least 1600px wide).
                      </p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>

              <CardFooter className='flex justify-between'>
                <div>
                  {saveSuccess && (
                    <span className='text-green-600 text-sm'>✓ Changes saved successfully</span>
                  )}
                </div>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700' disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Tabs>

        <div className='flex justify-between mt-8'>
          <Button variant='outline' onClick={() => router.push('/update/contact')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Contact Form
          </Button>
          <Button variant='outline' onClick={() => router.push('/update/document-download')}>
            Document Center
            <ArrowLeft className='ml-2 h-4 w-4 rotate-180' />
          </Button>
        </div>
      </div>
    </div>
  );
}
