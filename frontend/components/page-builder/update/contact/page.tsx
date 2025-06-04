'use client';

import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
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
  Share2,
  Type,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { BaseEntityDialog } from '@/components/entity-dialog';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { pageBuilderApi } from '@/lib/api';

interface SetupFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigateTo: (view: string, pageId?: string) => void;
  isLoading?: boolean;
}

// Form validation schema
const contactFormSchema = z.object({
  // Page configuration
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  subtitle: z.string().min(3, { message: 'Subtitle must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  bgImage: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  buttonText: z.string().min(2, { message: 'Button text must be at least 2 characters' }),
  accentColor: z.string().min(4, { message: 'Please enter a valid color' }),

  // Contact information
  contactInfo: z.object({
    address: z.string().min(5, { message: 'Address must be at least 5 characters' }).optional(),
    phone: z.string().min(10, { message: 'Please enter a valid phone number' }).optional(),
    email: z
      .string()
      .email({ message: 'Please enter a valid email address' })
      .optional()
      .or(z.literal('')),
  }),

  // Social links
  social: z.object({
    facebook: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    instagram: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    linkedin: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    twitter: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  }),

  // Page settings
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Default values for the form
const emptyFormValues: ContactFormValues = {
  title: 'Get in Touch With Our Team',
  subtitle: "We're here to help with all your real estate needs",
  description:
    'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
  bgImage:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
  buttonText: 'Send Message',
  accentColor: '#4f46e5',
  contactInfo: {
    address: '',
    phone: '',
    email: '',
  },
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  },
  slug: '',
  isPublic: false,
};

// Form steps
const steps = [
  { id: 'step-1', label: 'Basic Info' },
  { id: 'step-2', label: 'Appearance' },
  { id: 'step-3', label: 'Contact' },
  { id: 'step-4', label: 'Social' },
  { id: 'step-5', label: 'Settings' },
];

export default function SetupForm({
  pageId,
  open,
  onOpenChange,
  navigateTo,
  isLoading = false,
}: SetupFormProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Fetch existing page data if in edit mode
  const { data: existingPage, isLoading: isLoadingPageData } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? pageBuilderApi.getPage(pageId) : null),
    enabled: !!pageId && open,
  });

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyFormValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Check if slug is available
  const checkSlug = useMutation({
    mutationFn: async (slug: string) => {
      const response = await pageBuilderApi.checkSlug(slug);
      return response;
    },
    onSuccess: (data) => {
      setSlugAvailable(data.data.isUnique);
      setIsCheckingSlug(false);
      if (!data.data.isUnique) {
        form.setError('slug', {
          message: `This URL is already taken. Suggested URL: ${data.data.suggestedSlug}`,
        });
      } else {
        form.clearErrors('slug');
      }
    },
    onError: () => {
      setIsCheckingSlug(false);
    },
  });

  // Debounced slug check
  const debouncedSlugCheck = useCallback(
    debounce((value: string) => {
      if (value && value.length >= 3) {
        setIsCheckingSlug(true);
        checkSlug.mutate(value);
      } else {
        setSlugAvailable(false);
        setIsCheckingSlug(false);
      }
    }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSlugCheck.cancel();
    };
  }, [debouncedSlugCheck]);

  // Update form with existing data when available
  useEffect(() => {
    if (existingPage?.data) {
      const pageData = existingPage.data;
      const jsonData = pageData.jsonData || {};

      // Reset form with values from existing data
      form.reset({
        title: jsonData.title || '',
        subtitle: jsonData.subtitle || '',
        description: jsonData.description || '',
        bgImage: jsonData.bgImage || '',
        buttonText: jsonData.buttonText || '',
        accentColor: jsonData.accentColor || '#4f46e5',
        contactInfo: {
          address: jsonData.contactInfo?.address || '',
          phone: jsonData.contactInfo?.phone || '',
          email: jsonData.contactInfo?.email || '',
        },
        social: {
          facebook: jsonData.social?.facebook || '',
          instagram: jsonData.social?.instagram || '',
          linkedin: jsonData.social?.linkedin || '',
          twitter: jsonData.social?.twitter || '',
        },
        slug: pageData.slug || '',
        isPublic: pageData.isPublic || false,
      });
    }
  }, [existingPage, form]);

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      // Prepare the page data structure for our API
      const pageData = {
        title: values.title,
        templateType: 'CONTACT',
        jsonData: values,
        isPublic: values.isPublic,
        slug: values.slug || `contact-${Date.now()}`,
      };

      if (pageId) {
        return await pageBuilderApi.updatePage(pageId, pageData);
      } else {
        return await pageBuilderApi.createPage(pageData);
      }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      await queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      toast.success(`Contact page ${pageId ? 'updated' : 'created'} successfully`);
      if (!pageId) {
        navigateTo('dashboard');
      }
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving page:', error);
      toast.error(`Failed to ${pageId ? 'update' : 'create'} contact page`);
    },
  });

  // Handle next step navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step navigation
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (!pageId) {
      navigateTo('dashboard');
    }
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={handleClose}
      title={pageId ? 'Update Contact Page' : 'Create Contact Page'}
      schema={contactFormSchema}
      defaultValues={emptyFormValues}
      onSubmit={(values) => {
        if (currentStep === steps.length - 1) {
          savePage.mutate(values);
        }
      }}
      isLoading={isLoading || isLoadingPageData || savePage.isPending}
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
                      ? 'border-primary bg-primary text-white'
                      : index < currentStep
                        ? 'border-primary bg-white text-primary'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className='w-4 h-4' /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index === currentStep ? 'text-primary font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <div className='h-[55vh] overflow-y-auto pr-2'>
            {/* Basic Info */}
            {currentStep === 0 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Get in Touch With Our Team'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('title');
                          }}
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
                          placeholder='e.g. We are here to help with all your real estate needs'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('subtitle');
                          }}
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
                          placeholder='Enter a detailed description of your contact page'
                          className='min-h-[120px]'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('description');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Appearance */}
            {currentStep === 1 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='bgImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/your-background.jpg'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('bgImage');
                          }}
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
                          placeholder='e.g. Send Message'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('buttonText');
                          }}
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
                      <div className='flex items-center gap-2'>
                        <FormControl>
                          <Input
                            type='color'
                            className='w-12 h-10 p-1'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                          />
                        </FormControl>
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          className='flex-1'
                          disabled={isLoading || savePage.isPending}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Contact Info */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='contactInfo.phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. (555) 123-4567'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('contactInfo.phone');
                            }}
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. contact@example.com'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('contactInfo.email');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='contactInfo.address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter your office address'
                          className='min-h-[80px]'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('contactInfo.address');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Social Links */}
            {currentStep === 3 && (
              <div className='space-y-4 p-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='social.facebook'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='https://facebook.com/your-profile'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('social.facebook');
                            }}
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
                            placeholder='https://instagram.com/your-profile'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('social.instagram');
                            }}
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
                            placeholder='https://linkedin.com/in/your-profile'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('social.linkedin');
                            }}
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
                            placeholder='https://twitter.com/your-profile'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('social.twitter');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Settings */}
            {currentStep === 4 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page URL</FormLabel>
                      <div className='flex items-center space-x-2'>
                        <div className='flex-shrink-0 text-muted-foreground text-sm'>
                          {typeof window !== 'undefined' ? window.location.origin : ''}/p/
                        </div>
                        <FormControl>
                          <Input
                            placeholder={`portfolio-${Date.now()}`}
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              debouncedSlugCheck(e.target.value);
                            }}
                          />
                        </FormControl>
                      </div>
                      {field.value && (
                        <p
                          className={`text-xs ${
                            isCheckingSlug
                              ? 'text-gray-500'
                              : slugAvailable
                                ? 'text-green-600'
                                : 'text-red-600'
                          }`}
                        >
                          {isCheckingSlug
                            ? 'Checking availability...'
                            : slugAvailable
                              ? 'URL is available'
                              : 'URL is not available'}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isPublic'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 mt-4'>
                      <div className='space-y-0.5'>
                        <FormLabel>Publish Portfolio</FormLabel>
                        <p className='text-sm text-muted-foreground'>
                          Make your portfolio publicly accessible
                        </p>
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

          {/* Navigation Buttons */}
          <div className='flex justify-between space-x-4 mt-6'>
            <div>
              <Button
                type='button'
                variant='outline'
                disabled={isLoading || savePage.isPending}
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>

            <div className='flex space-x-2'>
              {currentStep > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handlePrevious}
                  disabled={isLoading || savePage.isPending}
                >
                  <ChevronLeft className='w-4 h-4 mr-2' />
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isLoading || savePage.isPending}
                  className='bg-primary/90 hover:bg-primary/95'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='button'
                  disabled={
                    isLoading || savePage.isPending || !form.formState.isValid || !slugAvailable
                  }
                  className='bg-primary/90 hover:bg-primary/95 min-w-[100px]'
                  onClick={() => {
                    form.handleSubmit((values: ContactFormValues) => {
                      savePage.mutate(values);
                    })();
                  }}
                >
                  {savePage.isPending
                    ? 'Saving...'
                    : pageId
                      ? 'Update Portfolio'
                      : 'Create Portfolio'}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      )}
    </BaseEntityDialog>
  );
}
