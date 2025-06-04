'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import {
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
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
import { api } from '@/lib/api';

interface ContactFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  navigateTo: (view: string, pageId?: string) => void;
}

// Form validation schema
const contactFormSchema = z.object({
  // Page configuration
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),

  // Template configuration
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bgImage: z.string().url('Please enter a valid URL').optional(),
  buttonText: z.string().optional(),
  accentColor: z.string().optional(),

  // Social links
  social: z.object({
    facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm({
  pageId,
  open,
  onOpenChange,
  isLoading: externalLoading,
  navigateTo,
}: ContactFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Initialize form with default values
  const form = useForm<ContactFormValues>({
    defaultValues: {
      slug: '',
      isPublic: false,
      title: 'Get in Touch With Our Team',
      subtitle: "We're here to help with all your real estate needs",
      description:
        'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
      bgImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
      buttonText: 'Send Message',
      accentColor: '#4f46e5',
      social: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
      },
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Fetch existing page data if in edit mode
  const { data: existingPage, isLoading: isLoadingPageData } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? api.get(`/page-builder/${pageId}`) : null),
    enabled: !!pageId && open,
  });

  // Steps configuration
  const steps = [
    { id: 'content', label: 'Content' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'social', label: 'Social' },
    { id: 'settings', label: 'Settings' },
  ];

  // Check if slug is available
  const checkSlug = useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.post('/page-builder/check-slug', { slug });
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
      const content = pageData.content || {};

      // Reset form with merged values from existing data
      form.reset({
        title: content.title || form.getValues('title'),
        subtitle: content.subtitle || form.getValues('subtitle'),
        description: content.description || form.getValues('description'),
        bgImage: content.bgImage || form.getValues('bgImage'),
        buttonText: content.buttonText || form.getValues('buttonText'),
        accentColor: content.accentColor || form.getValues('accentColor'),
        social: {
          facebook: content.social?.facebook || form.getValues('social.facebook'),
          instagram: content.social?.instagram || form.getValues('social.instagram'),
          linkedin: content.social?.linkedin || form.getValues('social.linkedin'),
          twitter: content.social?.twitter || form.getValues('social.twitter'),
        },
        slug: pageData.slug || form.getValues('slug'),
        isPublic: pageData.isPublic || form.getValues('isPublic'),
      });
    }
  }, [existingPage, form]);

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const pageData = {
        title: values.title,
        templateType: 'CONTACT',
        content: values,
        isPublic: values.isPublic,
        slug: values.slug || `contact-${Date.now()}`,
      };

      if (pageId) {
        return await api.put(`/page-builder/${pageId}`, pageData);
      } else {
        return await api.post('/page-builder', pageData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      toast.success(`Contact page ${pageId ? 'updated' : 'created'} successfully`);

      // Auto close and navigate after successful save
      setTimeout(() => {
        onOpenChange(false);
        if (!pageId) {
          navigateTo('dashboard');
        }
      }, 1000);
    },
    onError: (error) => {
      console.error('Error saving page:', error);
      toast.error(`Failed to ${pageId ? 'update' : 'create'} contact page`);
    },
  });

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(false);
        if (!pageId) {
          navigateTo('dashboard');
        }
      }
    } else {
      onOpenChange(false);
      if (!pageId) {
        navigateTo('dashboard');
      }
    }
  };

  const isLoading = externalLoading || isLoadingPageData || savePage.isPending;

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

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={handleClose}
      title={pageId ? 'Update Contact Page' : 'Create Contact Page'}
      schema={contactFormSchema}
      defaultValues={existingPage?.data?.content || form.getValues()}
      onSubmit={(values) => {
        savePage.mutate(values);
      }}
      isLoading={isLoading}
    >
      {(dialogForm) => (
        <Tabs value={steps[currentStep].id} className='w-full'>
          {/* Step Indicator */}
          <div className='flex items-center justify-between mb-6 px-1'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex flex-col items-center'>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    index === currentStep
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : index < currentStep
                        ? 'border-amber-600 bg-white text-amber-600'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className='w-4 h-4' /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index === currentStep ? 'text-amber-600 font-medium' : 'text-gray-500'
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
                          disabled={isLoading}
                          {...field}
                          onBlur={() => form.trigger('title')}
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
                          placeholder='Enter subtitle'
                          disabled={isLoading}
                          {...field}
                          onBlur={() => form.trigger('subtitle')}
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
                          placeholder='Enter page description'
                          disabled={isLoading}
                          className='min-h-[100px]'
                          {...field}
                          onBlur={() => form.trigger('description')}
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

                <FormField
                  control={form.control}
                  name='buttonText'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter button text'
                          disabled={isLoading}
                          {...field}
                          onBlur={() => form.trigger('buttonText')}
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
                        <div className='flex space-x-2'>
                          <Input
                            placeholder='Enter image URL'
                            disabled={isLoading}
                            {...field}
                            className='flex-1'
                          />
                          {field.value && (
                            <div
                              className='h-10 w-10 rounded border overflow-hidden bg-cover bg-center'
                              style={{ backgroundImage: `url(${field.value})` }}
                            />
                          )}
                        </div>
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
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <Input placeholder='#4f46e5' disabled={isLoading} {...field} />
                          <div
                            className='h-10 w-10 rounded border'
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Social */}
            {currentStep === 2 && (
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
            {currentStep === 3 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <div className='text-muted-foreground text-sm'>
                            {typeof window !== 'undefined' ? window.location.origin : ''}/p/
                          </div>
                          <Input
                            placeholder='your-contact-page'
                            disabled={isLoading}
                            {...field}
                            onBlur={() => {
                              form.trigger('slug');
                              if (field.value) {
                                debouncedSlugCheck(field.value);
                              }
                            }}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('slug');
                              debouncedSlugCheck(e.target.value);
                            }}
                          />
                        </div>
                      </FormControl>
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
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                      <div className='space-y-0.5'>
                        <FormLabel>Make Page Public</FormLabel>
                        <div className='text-sm text-muted-foreground'>
                          This will make your contact page accessible to anyone with the link
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            form.trigger('isPublic');
                          }}
                          disabled={isLoading}
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
              <Button type='button' variant='outline' disabled={isLoading} onClick={handleClose}>
                Cancel
              </Button>
            </div>

            <div className='flex space-x-2'>
              {currentStep > 0 && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  <ChevronLeft className='w-4 h-4 mr-2' />
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isLoading}
                  className='bg-amber-600 hover:bg-amber-700'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={isLoading || !form.formState.isValid || !slugAvailable}
                  className='bg-amber-600 hover:bg-amber-700 min-w-[100px]'
                >
                  {isLoading ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
                </Button>
              )}
            </div>
          </div>
        </Tabs>
      )}
    </BaseEntityDialog>
  );
}
