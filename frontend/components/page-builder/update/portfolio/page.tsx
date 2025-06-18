'use client';

import { useCallback, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import {
  Award,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Share2,
  Star,
  Type,
  User,
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

// Schema definition for the form
const portfolioFormSchema = z.object({
  // Personal info
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  title: z.string().min(2, { message: 'Title is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  image: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  bio: z.string().min(10, { message: 'Bio must be at least 10 characters' }),

  // Stats
  dealsCount: z.string(),
  propertyValue: z.string(),
  yearsExperience: z.string(),
  clientSatisfaction: z.string(),

  // Style and approach
  accentColor: z.string(),
  approach: z.string().min(10, { message: 'Please provide your approach' }),
  expertise: z.array(z.string()),
  certifications: z.array(z.string()),
  education: z.string(),

  // Contact info
  phone: z.string(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  officeAddress: z.string(),

  // Social info
  social: z.object({
    facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }),

  // Page settings
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),
});

// Type inference from zod schema
type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

// Empty form initial values
const emptyFormValues: PortfolioFormValues = {
  name: '',
  title: '',
  location: '',
  image: '',
  bio: '',
  dealsCount: '',
  propertyValue: '',
  yearsExperience: '',
  clientSatisfaction: '',
  accentColor: '',
  approach: '',
  expertise: [],
  certifications: [],
  education: '',
  phone: '',
  email: '',
  officeAddress: '',
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  },
  slug: '',
  isPublic: true,
};

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

  // Define the steps for the multi-step form
  const steps = [
    { id: 'step-1', label: 'Personal' },
    { id: 'step-2', label: 'Professional' },
    { id: 'step-3', label: 'Contact' },
    { id: 'step-4', label: 'Social' },
    { id: 'step-5', label: 'Settings' },
  ];

  // Fetch existing page data if in edit mode
  const { data: existingPage, isLoading: isLoadingPageData } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? pageBuilderApi.getPage(pageId) : null),
    enabled: !!pageId && open,
  });

  // Initialize form with empty values
  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioFormSchema),
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
        name: jsonData.name || '',
        title: jsonData.title || '',
        location: jsonData.location || '',
        image: jsonData.image || '',
        bio: jsonData.bio || '',
        dealsCount: jsonData.dealsCount || '',
        propertyValue: jsonData.propertyValue || '',
        yearsExperience: jsonData.yearsExperience || '',
        clientSatisfaction: jsonData.clientSatisfaction || '',
        accentColor: jsonData.accentColor || '#7b3ae4',
        approach: jsonData.approach || '',
        expertise: jsonData.expertise || ['', '', '', ''],
        certifications: jsonData.certifications || ['', '', '', ''],
        education: jsonData.education || '',
        phone: jsonData.phone || '',
        email: jsonData.email || '',
        officeAddress: jsonData.officeAddress || '',
        social: {
          facebook: jsonData.social?.facebook || '',
          instagram: jsonData.social?.instagram || '',
          linkedin: jsonData.social?.linkedin || '',
          twitter: jsonData.social?.twitter || '',
        },
        slug: pageData.slug || '',
        isPublic: pageData.isPublic || true,
      });
    }
  }, [existingPage, form]);

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: PortfolioFormValues) => {
      // Prepare the page data structure for our API
      const pageData = {
        title: values.name,
        templateType: 'PORTFOLIO',
        jsonData: values,
        isPublic: values.isPublic,
        slug: values.slug || `portfolio-${Date.now()}`,
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
      toast.success(`Portfolio ${pageId ? 'updated' : 'created'} successfully`);
      if (!pageId) {
        navigateTo('dashboard');
      }
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error saving page:', error);
      toast.error(`Failed to ${pageId ? 'update' : 'create'} portfolio`);
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
      title={pageId ? 'Update Portfolio' : 'Create Portfolio'}
      schema={portfolioFormSchema}
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
            {/* Personal Info */}
            {currentStep === 0 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Sarah Johnson'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('name');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Luxury Real Estate Specialist'
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
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. San Francisco Bay Area, CA'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('location');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Photo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/your-photo.jpg'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('image');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell clients about yourself and your experience...'
                          className='min-h-[120px]'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('bio');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Professional Details */}
            {currentStep === 1 && (
              <div className='space-y-4 p-2'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='yearsExperience'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years Experience</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. 15+'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('yearsExperience');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dealsCount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Properties Sold</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. 350+'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('dealsCount');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='propertyValue'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Value Sold</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. $500M+'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('propertyValue');
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='clientSatisfaction'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Satisfaction</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. 98%'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('clientSatisfaction');
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

                <FormField
                  control={form.control}
                  name='approach'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Approach</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your approach to real estate...'
                          className='min-h-[120px]'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('approach');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <FormLabel>Areas of Expertise</FormLabel>
                  {form.getValues('expertise')?.map((_: any, index: number) => (
                    <FormField
                      key={`expertise-${index}`}
                      control={form.control}
                      name={`expertise.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`Expertise ${index + 1}`}
                              disabled={isLoading || savePage.isPending}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger(`expertise.${index}`);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className='space-y-2'>
                  <FormLabel>Certifications</FormLabel>
                  {form.getValues('certifications')?.map((_: any, index: number) => (
                    <FormField
                      key={`certifications-${index}`}
                      control={form.control}
                      name={`certifications.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`Certification ${index + 1}`}
                              disabled={isLoading || savePage.isPending}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger(`certifications.${index}`);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name='education'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Bachelor of Business Administration in Real Estate'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('education');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Contact Info */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. (415) 555-0123'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('phone');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. sarah@example.com'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('email');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='officeAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. 123 Market Street, San Francisco, CA 94105'
                          disabled={isLoading || savePage.isPending}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('officeAddress');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Social Media */}
            {currentStep === 3 && (
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
                  name='social.twitter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://twitter.com/yourhandle'
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
                          placeholder='https://linkedin.com/in/yourpage'
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
              </div>
            )}

            {/* Page Settings */}
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
                    form.handleSubmit((values: PortfolioFormValues) => {
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
