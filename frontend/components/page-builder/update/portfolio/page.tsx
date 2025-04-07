'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { api } from '@/lib/api';

interface SetupFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

// Form validation schema
const portfolioFormSchema = z.object({
  // Page configuration
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),

  // Personal Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  location: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

  // Stats
  dealsCount: z.string().optional(),
  propertyValue: z.string().optional(),
  yearsExperience: z.string().optional(),
  clientSatisfaction: z.string().optional(),

  // Appearance
  accentColor: z.string().optional(),

  // About
  approach: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  education: z.string().optional(),

  // Contact
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional(),
  officeLocation: z.string().optional(),

  // Social links
  facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),

  // Testimonials
  testimonials: z
    .array(
      z.object({
        text: z.string().optional(),
        client: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .optional(),
});

type PortfolioFormValues = z.infer<typeof portfolioFormSchema>;

export default function SetupForm({ pageId, open, onOpenChange, isLoading }: SetupFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // Steps configuration
  const steps = [
    { id: 'personal', label: 'Personal' },
    { id: 'stats', label: 'Stats' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'settings', label: 'Settings' },
  ];

  // Default values for the form
  const defaultValues: PortfolioFormValues = {
    // Page configuration
    slug: '',
    isPublic: false,

    // Personal Info
    name: 'Sarah Johnson',
    title: 'Luxury Real Estate Specialist',
    location: 'San Francisco Bay Area, CA',
    bio: 'With over 15 years of experience, I specialize in luxury properties and helping clients make informed decisions in the competitive Bay Area market.',
    profileImage:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80',

    // Stats
    dealsCount: '350+',
    propertyValue: '$500M+',
    yearsExperience: '15+',
    clientSatisfaction: '98%',

    // Appearance
    accentColor: '#4f46e5', // Default purple/indigo color

    // About
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

    // Contact
    phone: '(415) 555-0123',
    email: 'sarah@sarahjohnsonrealty.com',
    officeLocation: '123 Market Street, San Francisco, CA 94105',

    // Social links
    facebook: 'https://facebook.com/sarahjohnsonrealty',
    instagram: 'https://instagram.com/sarahjohnsonrealty',
    linkedin: 'https://linkedin.com/in/sarahjohnsonrealty',

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
  };

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: PortfolioFormValues) => {
      const pageData = {
        title: values.name,
        templateType: 'portfolio',
        content: values,
        isPublic: values.isPublic,
        slug: values.slug || `portfolio-${Date.now()}`,
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
      toast.success(`Portfolio ${pageId ? 'updated' : 'created'} successfully`);
    },
    onError: () => {
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

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pageId ? 'Update Portfolio' : 'Create Portfolio'}
      schema={portfolioFormSchema}
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
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='e.g. Helping clients find their dream homes...'
                          disabled={isLoading || savePage.isPending}
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='profileImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <div className='flex space-x-2'>
                          <Input
                            placeholder='Enter image URL'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                            className='flex-1'
                          />
                          {field.value && (
                            <div
                              className='h-10 w-10 rounded-full border overflow-hidden bg-cover bg-center'
                              style={{ backgroundImage: `url(${field.value})` }}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Stats */}
            {currentStep === 1 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='dealsCount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Deals</FormLabel>
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
                      <FormLabel>Total Property Value</FormLabel>
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
                  name='yearsExperience'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
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
                  name='clientSatisfaction'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Satisfaction Rate</FormLabel>
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
            )}

            {/* About */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='approach'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Approach</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Describe your approach to real estate'
                          disabled={isLoading || savePage.isPending}
                          className='min-h-[100px]'
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

                <FormField
                  control={form.control}
                  name='accentColor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-8 w-8 rounded-full border'
                          style={{ backgroundColor: field.value || '#4f46e5' }}
                        />
                        <FormControl>
                          <Input
                            type='text'
                            placeholder='#4f46e5'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Choose a color for portfolio accents and highlights
                      </p>
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
                  name='officeLocation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Location</FormLabel>
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

                <div className='space-y-4 mt-6'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-base'>Testimonials</FormLabel>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => addTestimonial(form)}
                      disabled={isLoading || savePage.isPending}
                    >
                      Add Testimonial
                    </Button>
                  </div>

                  {form.getValues('testimonials')?.map((_: any, index: number) => (
                    <div
                      key={`testimonial-${index}`}
                      className='space-y-4 p-4 border rounded-md relative'
                    >
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute top-2 right-2 h-8 w-8 p-0'
                        onClick={() => removeTestimonial(form, index)}
                        disabled={isLoading || savePage.isPending}
                      >
                        ×
                      </Button>

                      <FormField
                        control={form.control}
                        name={`testimonials.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial Text</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Enter client testimonial'
                                disabled={isLoading || savePage.isPending}
                                className='min-h-[80px]'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='grid grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`testimonials.${index}.client`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='e.g. John & Lisa Thomason'
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
                          name={`testimonials.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Location</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='e.g. Palo Alto'
                                  disabled={isLoading || savePage.isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
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
                      <FormLabel>Page URL Slug</FormLabel>
                      <FormControl>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground text-sm'>yoursite.com/p/</span>
                          <Input
                            placeholder='your-name-realtor'
                            disabled={isLoading || savePage.isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className='text-xs text-muted-foreground mt-1'>
                        This will be used in the public URL for your portfolio
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='isPublic'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 mt-6'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Publish Portfolio</FormLabel>
                        <p className='text-xs text-muted-foreground'>
                          When published, your portfolio will be accessible to the public
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
                onClick={() => onOpenChange(false)}
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
