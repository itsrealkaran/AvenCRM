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
  Search,
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
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { pageBuilderApi } from '@/lib/api';

interface LocationSearchFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigateTo: (view: string, pageId?: string) => void;
  isLoading?: boolean;
}

// Form validation schema
const locationSearchFormSchema = z.object({
  // Page configuration
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),

  // Template configuration
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  subtitle: z.string().min(3, { message: 'Subtitle must be at least 3 characters' }).optional(),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .optional(),
  bgImage: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  searchPlaceholder: z
    .string()
    .min(3, { message: 'Placeholder must be at least 3 characters' })
    .optional(),
  buttonText: z
    .string()
    .min(2, { message: 'Button text must be at least 2 characters' })
    .optional(),
  accentColor: z.string().min(4, { message: 'Please enter a valid color' }).optional(),

  // Agent information
  agentName: z.string().min(2, { message: 'Agent name must be at least 2 characters' }).optional(),
  agentTitle: z
    .string()
    .min(2, { message: 'Agent title must be at least 2 characters' })
    .optional(),
  agentImage: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),

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
});

type LocationSearchFormValues = z.infer<typeof locationSearchFormSchema>;

// Default values for the form
const defaultValues: LocationSearchFormValues = {
  title: '',
  subtitle: '',
  description: '',
  bgImage: '',
  searchPlaceholder: '',
  buttonText: '',
  accentColor: '#3b82f6',
  agentName: '',
  agentTitle: '',
  agentImage: '',
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
  isPublic: true,
};

// Form steps
const steps = [
  { id: 'step-1', label: 'Basic Info' },
  { id: 'step-2', label: 'Appearance' },
  { id: 'step-3', label: 'Agent Info' },
  { id: 'step-4', label: 'Contact' },
  { id: 'step-5', label: 'Social' },
  { id: 'step-6', label: 'Settings' },
];

export default function LocationSearchForm({
  pageId,
  open,
  onOpenChange,
  navigateTo,
  isLoading = false,
}: LocationSearchFormProps) {
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
  const form = useForm<LocationSearchFormValues>({
    resolver: zodResolver(locationSearchFormSchema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
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

      // Reset form with merged values from existing data
      form.reset({
        title: jsonData.title || defaultValues.title,
        subtitle: jsonData.subtitle || defaultValues.subtitle,
        description: jsonData.description || defaultValues.description,
        bgImage: jsonData.bgImage || defaultValues.bgImage,
        searchPlaceholder: jsonData.searchPlaceholder || defaultValues.searchPlaceholder,
        buttonText: jsonData.buttonText || defaultValues.buttonText,
        accentColor: jsonData.accentColor || defaultValues.accentColor,
        agentName: jsonData.agentName || defaultValues.agentName,
        agentTitle: jsonData.agentTitle || defaultValues.agentTitle,
        agentImage: jsonData.agentImage || defaultValues.agentImage,
        contactInfo: {
          address: jsonData.contactInfo?.address || defaultValues.contactInfo.address,
          phone: jsonData.contactInfo?.phone || defaultValues.contactInfo.phone,
          email: jsonData.contactInfo?.email || defaultValues.contactInfo.email,
        },
        social: {
          facebook: jsonData.social?.facebook || defaultValues.social.facebook,
          instagram: jsonData.social?.instagram || defaultValues.social.instagram,
          linkedin: jsonData.social?.linkedin || defaultValues.social.linkedin,
          twitter: jsonData.social?.twitter || defaultValues.social.twitter,
        },
        slug: pageData.slug || '',
        isPublic: pageData.isPublic || true,
      });
    }
  }, [existingPage, form]);

  // Save page mutation
  const savePage = useMutation({
    mutationFn: async (values: LocationSearchFormValues) => {
      const pageData = {
        title: values.title,
        templateType: 'LOCATION',
        jsonData: values,
        isPublic: values.isPublic,
        slug: values.slug || `property-search-${Date.now()}`,
      };

      if (pageId) {
        return await pageBuilderApi.updatePage(pageId, pageData);
      } else {
        return await pageBuilderApi.createPage(pageData);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      toast.success(`Location search page ${pageId ? 'updated' : 'created'} successfully`);

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

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={handleClose}
      title={pageId ? 'Update Location Search Page' : 'Create Location Search Page'}
      schema={locationSearchFormSchema}
      defaultValues={defaultValues}
      onSubmit={(values) => {
        savePage.mutate(values);
      }}
      isLoading={isLoading || savePage.isPending || isLoadingPageData}
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
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
                          placeholder='https://example.com/image.jpg'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('bgImage')}
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
                  name='searchPlaceholder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Placeholder Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter city, neighborhood, or zip code'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('searchPlaceholder')}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('searchPlaceholder');
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
                      <FormLabel>Search Button Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Search Properties'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
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
                            className='w-16 h-8 p-1'
                            disabled={isLoading || savePage.isPending || isLoadingPageData}
                            {...field}
                            onBlur={() => form.trigger('accentColor')}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger('accentColor');
                            }}
                          />
                        </FormControl>
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('accentColor');
                          }}
                          onBlur={() => form.trigger('accentColor')}
                          placeholder='#3b82f6'
                          maxLength={7}
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          className='w-full'
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Agent Info */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='agentName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Sarah Johnson'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('agentName')}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('agentName');
                          }}
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
                      <FormLabel>Agent Title/Position</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Senior Real Estate Agent'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('agentTitle')}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('agentTitle');
                          }}
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('agentImage')}
                          onChange={(e) => {
                            field.onChange(e);
                            form.trigger('agentImage');
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
            {currentStep === 3 && (
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('contactInfo.address')}
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

                <FormField
                  control={form.control}
                  name='contactInfo.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(123) 456-7890'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('contactInfo.phone')}
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='contact@example.com'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('contactInfo.email')}
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
            )}

            {/* Social Media */}
            {currentStep === 4 && (
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
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('social.facebook')}
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
                          placeholder='https://instagram.com/youraccount'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('social.instagram')}
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
                  name='social.twitter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://twitter.com/youraccount'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('social.twitter')}
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
                  name='social.linkedin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://linkedin.com/in/yourprofile'
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
                          {...field}
                          onBlur={() => form.trigger('social.linkedin')}
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
            {currentStep === 5 && (
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
                            placeholder='your-document-page'
                            disabled={isLoading || savePage.isPending || isLoadingPageData}
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
                          This will make your document page accessible to anyone with the link
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            form.trigger('isPublic');
                          }}
                          disabled={isLoading || savePage.isPending || isLoadingPageData}
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
              <Button
                type='button'
                variant='outline'
                disabled={savePage.isPending || isLoadingPageData}
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
                  disabled={savePage.isPending || isLoadingPageData}
                >
                  <ChevronLeft className='w-4 h-4 mr-2' />
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={savePage.isPending || isLoadingPageData}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={savePage.isPending || !form.formState.isValid || isLoadingPageData}
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
