'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  image: z.string().url({ message: 'Please enter a valid URL' }),
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
  email: z.string().email({ message: 'Please enter a valid email address' }),
  officeAddress: z.string(),

  // Social info
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),

  // Testimonials
  testimonials: z.array(
    z.object({
      text: z.string(),
      client: z.string(),
      location: z.string(),
    })
  ),

  // Page settings
  slug: z.string().optional(),
  isPublic: z.boolean().default(false),
});

// Type inference from zod schema
type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export default function SetupForm({
  pageId,
  open,
  onOpenChange,
  navigateTo,
  isLoading = false,
}: SetupFormProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // Define the steps for the multi-step form
  const steps = [
    { id: 'personal', label: 'Personal' },
    { id: 'professional', label: 'Professional' },
    { id: 'contact', label: 'Contact' },
    { id: 'settings', label: 'Settings' },
  ];

  // Fetch existing page data if in edit mode
  const { data: existingPageData, isLoading: isLoadingPageData } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? pageBuilderApi.getPage(pageId) : null),
    enabled: !!pageId && open,
  });

  // Default values for the form
  const defaultValues: PortfolioFormValues = {
    // Personal info
    name: 'Sarah Johnson',
    title: 'Luxury Real Estate Specialist',
    location: 'San Francisco Bay Area, CA',
    image:
      'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cG9ydHJhaXQlMjBtYW58ZW58MHx8MHx8fDA%3D',
    bio: 'With over 15 years of experience, I specialize in luxury properties and helping clients make informed decisions in the competitive Bay Area market.',

    // Stats
    dealsCount: '350+',
    propertyValue: '$500M+',
    yearsExperience: '15+',
    clientSatisfaction: '98%',

    // Style and approach
    accentColor: '#7c3aed',
    approach:
      'I believe in personalized service and leveraging the latest technology to ensure my clients get the best deals in the market.',
    expertise: [
      'Luxury Residential Properties',
      'Investment Properties',
      'First-Time Home Buyers',
      'Property Valuation',
    ],
    certifications: [
      'Certified Residential Specialist (CRS)',
      "Accredited Buyer's Representative (ABR)",
      'Luxury Home Marketing Specialist',
      'Certified Negotiation Expert (CNE)',
    ],
    education:
      'Bachelor of Business Administration in Real Estate, University of California, Berkeley',

    // Contact info
    phone: '(415) 555-0123',
    email: 'sarah@sarahjohnsonrealty.com',
    officeAddress: '123 Market Street, San Francisco, CA 94105',

    // Social info
    facebook: 'https://www.facebook.com/sarahjohnsonrealty',
    instagram: 'https://www.instagram.com/sarahjohnsonrealty',
    linkedin: 'https://www.linkedin.com/company/sarahjohnsonrealty',
    twitter: 'https://www.twitter.com/sarahjohnsonrealty',

    // Testimonials
    testimonials: [
      {
        text: 'Sarah helped us find our dream home in a competitive market. Her expertise and negotiation skills were invaluable.',
        client: 'John & Lisa Thomason',
        location: 'Palo Alto',
      },
      {
        text: 'Working with Sarah made selling our home stress-free. She handled everything professionally and got us above asking price.',
        client: 'Michael Chen',
        location: 'San Francisco',
      },
      {
        text: "As first-time buyers, we appreciated Sarah's patience and guidance throughout the process. Highly recommended!",
        client: 'Emma & David Wilson',
        location: 'Menlo Park',
      },
    ],

    // Page settings
    slug: '',
    isPublic: false,
  };

  // Use existing data if available
  useEffect(() => {
    if (existingPageData?.data) {
      // Reset form with existing data
      const pageData = existingPageData.data;
      if (pageData.jsonData) {
        // If editing an existing page, we should update our defaultValues
        const jsonData = pageData.jsonData;
        // We'll handle this in the BaseEntityDialog by passing the updated defaultValues
      }
    }
  }, [existingPageData, open]);

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: PortfolioFormValues) => {
      // Social media links structure
      const social = {
        facebook: values.facebook || '',
        instagram: values.instagram || '',
        linkedin: values.linkedin || '',
        twitter: values.twitter || '',
      };

      // Prepare the page data structure for our API
      const pageData = {
        title: values.name,
        slug: values.slug || `portfolio-${Date.now()}`,
        templateType: 'PORTFOLIO',
        description: values.bio.substring(0, 100) + (values.bio.length > 100 ? '...' : ''),
        jsonData: {
          ...values,
          social,
        },
        isPublic: values.isPublic,
      };

      if (pageId) {
        return await pageBuilderApi.updatePage(pageId, pageData);
      } else {
        return await pageBuilderApi.createPage(pageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      if (pageId) {
        queryClient.invalidateQueries({ queryKey: ['page', pageId] });
      }
      onOpenChange(false);
      toast.success(`Portfolio ${pageId ? 'updated' : 'created'} successfully`);
    },
    onError: (error: any) => {
      console.error('Error saving page:', error);
      toast.error(
        `Failed to ${pageId ? 'update' : 'create'} portfolio: ${error?.response?.data?.message || 'Unknown error'}`
      );
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
    navigateTo('dashboard');
  };

  // Function to add a new testimonial field
  const addTestimonial = (form: any) => {
    const currentTestimonials = form.getValues('testimonials') || [];
    form.setValue('testimonials', [...currentTestimonials, { text: '', client: '', location: '' }]);
  };

  // Function to remove a testimonial field
  const removeTestimonial = (form: any, index: number) => {
    const currentTestimonials = form.getValues('testimonials') || [];
    form.setValue(
      'testimonials',
      currentTestimonials.filter((_: any, i: number) => i !== index)
    );
  };

  // Calculate initial values for the form
  const initialValues = existingPageData?.data?.jsonData || defaultValues;

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={handleClose}
      title={pageId ? 'Update Portfolio' : 'Create Portfolio'}
      schema={portfolioFormSchema}
      defaultValues={initialValues}
      onSubmit={(values) => {
        savePage.mutate(values);
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='facebook'
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
                  name='twitter'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://twitter.com/yourhandle'
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
                  name='instagram'
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
                  name='linkedin'
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

            {/* Page Settings */}
            {currentStep === 3 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='slug'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page URL</FormLabel>
                      <div className='flex items-center space-x-2'>
                        <div className='flex-shrink-0 text-muted-foreground text-sm'>
                          yourdomain.com/p/
                        </div>
                        <FormControl>
                          <Input
                            placeholder={`portfolio-${Date.now()}`}
                            disabled={isLoading || savePage.isPending}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Enter a unique URL for your portfolio page or leave blank to auto-generate
                      </p>
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
                onClick={handleClose}
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={savePage.isPending}
                  className='bg-primary/90 hover:bg-primary/95'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={savePage.isPending || !form.formState.isValid}
                  className='bg-primary/90 hover:bg-primary/95 min-w-[100px]'
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
