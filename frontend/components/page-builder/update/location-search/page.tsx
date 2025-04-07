'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Mail,
  MapPin,
  Palette,
  Phone,
  Search,
  Share2,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import { BaseEntityDialog } from '@/components/entity-dialog';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface LocationSearchFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

// Form validation schema
const locationSearchFormSchema = z.object({
  // Page configuration
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),

  // Template configuration
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bgImage: z.string().url('Please enter a valid URL').optional(),
  searchPlaceholder: z.string().optional(),
  buttonText: z.string().optional(),
  accentColor: z.string().optional(),

  // Agent information
  agentName: z.string().optional(),
  agentTitle: z.string().optional(),
  agentImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

  // Contact information
  contactInfo: z.object({
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  }),

  // Social links
  social: z.object({
    facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }),
});

type LocationSearchFormValues = z.infer<typeof locationSearchFormSchema>;

export default function LocationSearchForm({
  pageId,
  open,
  onOpenChange,
  isLoading,
}: LocationSearchFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Define form steps
  const steps = [
    { id: 'content', label: 'Content', icon: <Type className='h-4 w-4' /> },
    { id: 'search', label: 'Search Options', icon: <Search className='h-4 w-4' /> },
    { id: 'appearance', label: 'Appearance', icon: <ImageIcon className='h-4 w-4' /> },
    { id: 'agent', label: 'Agent Info', icon: <Building className='h-4 w-4' /> },
    { id: 'contact', label: 'Contact Info', icon: <Phone className='h-4 w-4' /> },
    { id: 'social', label: 'Social Media', icon: <Share2 className='h-4 w-4' /> },
    { id: 'settings', label: 'Page Settings', icon: <CheckCircle className='h-4 w-4' /> },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  // Default form values
  const defaultValues: LocationSearchFormValues = {
    title: 'Find Your Dream Home',
    subtitle: 'Search for properties in your desired location and connect with our expert agents.',
    description:
      'Our comprehensive property search platform allows you to explore a wide range of residential and commercial properties in your desired location.',
    bgImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
    searchPlaceholder: 'Enter your address...',
    buttonText: 'Search',
    accentColor: '#2563eb',
    agentName: 'John Doe',
    agentTitle: 'Real Estate Agent',
    agentImage: '',
    contactInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '(123) 456-7890',
      email: 'john.doe@example.com',
    },
    social: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
    },
    isPublic: false,
  };

  const savePage = useMutation({
    mutationFn: async (values: LocationSearchFormValues) => {
      const pageData = {
        title: values.title,
        templateType: 'location-search',
        content: values,
        isPublic: values.isPublic,
        slug: values.slug || `property-search-${Date.now()}`,
      };

      if (pageId) {
        return await api.put(`/page-builder/${pageId}`, pageData);
      } else {
        return await api.post('/page-builder', pageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      onOpenChange(false);
      toast.success(`Location search page ${pageId ? 'updated' : 'created'} successfully`);
    },
    onError: () => {
      toast.error(`Failed to ${pageId ? 'update' : 'create'} location search page`);
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pageId ? 'Update Location Search Page' : 'Create Location Search Page'}
      schema={locationSearchFormSchema}
      defaultValues={defaultValues}
      onSubmit={(values) => {
        savePage.mutate(values);
      }}
      isLoading={isLoading || savePage.isPending}
    >
      {(form) => (
        <Tabs value={steps[currentStep].id} className='w-full'>
          {/* Step Indicator */}
          <div className='flex items-center justify-between mb-6 px-1'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex flex-col items-center'>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index === currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : index < currentStep
                        ? 'border-blue-600 bg-white text-blue-600'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className='w-4 h-4' /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className='h-[55vh] overflow-y-auto pr-2'>
            {/* Content */}
            {currentStep === 0 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter page title'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='subtitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter subtitle'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter page description'
                          disabled={isLoading || savePage.isPending}
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Search Options */}
            {currentStep === 1 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='searchPlaceholder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Placeholder Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Enter your address...'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='buttonText'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g., Search'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Appearance */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='bgImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/image.jpg'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='accentColor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className='flex space-x-2'>
                        <FormControl>
                          <Input
                            placeholder='#2563eb'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                          />
                        </FormControl>
                        <input
                          type='color'
                          value={field.value || '#2563eb'}
                          onChange={(e) => field.onChange(e.target.value)}
                          className='h-10 w-12 rounded border p-1'
                          disabled={isLoading || savePage.isPending}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Agent Info */}
            {currentStep === 3 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='agentName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='John Doe'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='agentTitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Real Estate Agent'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='agentImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/agent.jpg'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Contact Info */}
            {currentStep === 4 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='contactInfo.address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='123 Main St, Anytown, USA'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactInfo.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(123) 456-7890'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactInfo.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='contact@example.com'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Social Media */}
            {currentStep === 5 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='social.facebook'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://facebook.com/yourpage'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='social.instagram'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://instagram.com/yourpage'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='social.twitter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://twitter.com/yourpage'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='social.linkedin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://linkedin.com/in/yourpage'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Settings */}
            {currentStep === 6 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter URL slug (e.g., property-search)'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className='text-xs text-muted-foreground'>
                        This will determine your page URL: yourdomain.com/p/
                        {field.value || 'property-search-[timestamp]'}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isPublic'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Public Page</FormLabel>
                        <div className='text-sm text-muted-foreground'>
                          Make this page publicly accessible
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading || savePage.isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className='flex justify-between space-x-4 mt-6'>
            <div>
              {currentStep > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handlePrevious}
                  disabled={savePage.isPending}
                >
                  <ChevronLeft className='w-4 h-4 mr-2' />
                  Previous
                </Button>
              )}
            </div>

            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='outline'
                disabled={savePage.isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={savePage.isPending}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={savePage.isPending || !form.formState.isValid}
                  className='bg-blue-600 hover:bg-blue-700 min-w-[100px]'
                >
                  {savePage.isPending ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      )}
    </BaseEntityDialog>
  );
}
