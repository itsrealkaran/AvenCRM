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

export default function UpdateContact({ navigateTo }: SetupFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    contactFormTitle: 'Get in Touch With Our Team',
    contactFormDescription:
      'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
    contactFormBackgroundImage: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const savedData = localStorage.getItem('realtorData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData({
        contactFormTitle: parsedData.contactFormTitle || formData.contactFormTitle,
        contactFormDescription:
          parsedData.contactFormDescription || formData.contactFormDescription,
        contactFormBackgroundImage:
          parsedData.contactFormBackgroundImage || formData.contactFormBackgroundImage,
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

      // Update only the contact form fields
      const updatedData = {
        ...parsedData,
        contactFormTitle: formData.contactFormTitle,
        contactFormDescription: formData.contactFormDescription,
        contactFormBackgroundImage: formData.contactFormBackgroundImage,
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
    router.push('/contact/preview');
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
            <h1 className='text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent'>
              Update Contact Form
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
                <CardTitle className='text-xl'>Contact Form Settings</CardTitle>
              </CardHeader>

              <CardContent>
                <TabsContent value='content' className='space-y-6 mt-0'>
                  <div className='space-y-2'>
                    <Label htmlFor='contactFormTitle'>Form Title</Label>
                    <Input
                      id='contactFormTitle'
                      name='contactFormTitle'
                      value={formData.contactFormTitle}
                      onChange={handleChange}
                      placeholder='e.g. Get in Touch With Our Team'
                      required
                    />
                    <p className='text-xs text-muted-foreground'>
                      This title appears at the top of your contact form page.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='contactFormDescription'>Form Description</Label>
                    <Textarea
                      id='contactFormDescription'
                      name='contactFormDescription'
                      value={formData.contactFormDescription}
                      onChange={handleChange}
                      placeholder='e.g. Have questions about buying or selling a property?...'
                      rows={4}
                      required
                    />
                    <p className='text-xs text-muted-foreground'>
                      This description appears below the title and helps explain the purpose of the
                      contact form.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value='appearance' className='space-y-6 mt-0'>
                  <div className='space-y-2'>
                    <Label htmlFor='contactFormBackgroundImage'>Background Image URL</Label>
                    <Input
                      id='contactFormBackgroundImage'
                      name='contactFormBackgroundImage'
                      value={formData.contactFormBackgroundImage}
                      onChange={handleChange}
                      placeholder='e.g. https://example.com/background-image.jpg'
                    />
                    <p className='text-xs text-muted-foreground'>
                      This image will be used as the background for the contact form section. Leave
                      empty to use the default image.
                    </p>
                  </div>

                  {formData.contactFormBackgroundImage && (
                    <div className='border rounded-md p-4'>
                      <p className='text-sm font-medium mb-2'>Background Image Preview</p>
                      <div className='aspect-video relative rounded-md overflow-hidden bg-gray-100'>
                        <img
                          src={formData.contactFormBackgroundImage || '/placeholder.svg'}
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
                <Button
                  type='submit'
                  className='bg-amber-600 hover:bg-amber-700'
                  disabled={isSaving}
                >
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
          <Button variant='outline' onClick={() => router.push('/update/document-download')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Document Center
          </Button>
          <Button variant='outline' onClick={() => router.push('/update/location-search')}>
            Location Search
            <ArrowLeft className='ml-2 h-4 w-4 rotate-180' />
          </Button>
        </div>
      </div>
    </div>
  );
}
