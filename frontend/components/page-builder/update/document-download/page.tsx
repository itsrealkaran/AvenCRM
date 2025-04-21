'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { pageBuilderApi } from '@/lib/api';

interface DocumentDownloadFormProps {
  pageId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

// Form validation schema
const documentDownloadFormSchema = z.object({
  // Page configuration
  slug: z.string().min(3, 'Slug must be at least 3 characters').optional(),
  isPublic: z.boolean().default(false),

  // Template configuration
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  bgImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  buttonText: z.string().optional(),
  accentColor: z.string().optional(),
  documentRequireForm: z.boolean().default(true),

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

  // Documents array
  documents: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      fileSize: z.string().optional(),
      fileType: z.string().optional(),
      downloadUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    })
  ).default([]),
});

type DocumentDownloadFormValues = z.infer<typeof documentDownloadFormSchema>;

export default function DocumentDownloadForm({
  pageId,
  open,
  onOpenChange,
  isLoading: externalLoading,
}: DocumentDownloadFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const [slugAvailable, setSlugAvailable] = useState(true);
  
  // Fetch page data if editing an existing page
  const { data: pageData, isLoading: isLoadingPage } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => (pageId ? pageBuilderApi.getPage(pageId) : null),
    enabled: !!pageId && open,
  });

  // Steps configuration
  const steps = [
    { id: 'content', label: 'Content' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'documents', label: 'Documents' },
    { id: 'agent', label: 'Agent Info' },
    { id: 'social', label: 'Social' },
    { id: 'settings', label: 'Settings' },
  ];

  // Default values for the form
  const defaultValues: DocumentDownloadFormValues = {
    slug: '',
    isPublic: false,
    title: 'Document Resource Center',
    subtitle: 'Access our comprehensive collection of real estate documents',
    description:
      'Our document center provides all the forms and resources you need for your real estate transaction. Download contracts, disclosures, and other important documents.',
    bgImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80',
    buttonText: 'Download Documents',
    accentColor: '#059669',
    documentRequireForm: true,
    agentName: 'John Doe',
    agentTitle: 'Real Estate Agent',
    agentImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    contactInfo: {
      address: '123 Main St, Anytown, USA',
      phone: '(123) 456-7890',
      email: 'john.doe@example.com',
    },
    social: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    documents: [
      {
        title: 'Purchase Agreement',
        description: 'Standard real estate purchase agreement template',
        fileSize: '245 KB',
        fileType: 'PDF',
        downloadUrl: 'https://example.com/documents/purchase-agreement.pdf',
      },
      {
        title: 'Listing Contract',
        description: 'Property listing agreement document',
        fileSize: '198 KB',
        fileType: 'DOCX',
        downloadUrl: 'https://example.com/documents/listing-contract.docx',
      },
      {
        title: 'Home Inspection Checklist',
        description: 'Comprehensive home inspection guide',
        fileSize: '312 KB',
        fileType: 'PDF',
        downloadUrl: 'https://example.com/documents/inspection-checklist.pdf',
      },
    ],
  };

  // Mutation for checking slug availability
  const checkSlug = useMutation({
    mutationFn: async (slug: string) => {
      const result = await pageBuilderApi.checkSlugAvailability(slug);
      return result;
    },
    onSuccess: (data) => {
      setSlugAvailable(data.data.available);
      if (!data.data.available) {
        toast.error('This URL is already taken. Please choose another one.');
      }
    },
  });

  // Mutation for saving the form
  const savePage = useMutation({
    mutationFn: async (values: DocumentDownloadFormValues) => {
      const pageData = {
        title: values.title,
        templateType: 'document-download',
        content: values,
        isPublic: values.isPublic,
        slug: values.slug || `documents-${Date.now()}`,
      };

      if (pageId) {
        return await pageBuilderApi.updatePage(pageId, pageData);
      } else {
        return await pageBuilderApi.createPage(pageData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      onOpenChange(false);
      toast.success(`Document download page ${pageId ? 'updated' : 'created'} successfully`);
    },
    onError: () => {
      toast.error(`Failed to ${pageId ? 'update' : 'create'} document download page`);
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

  // Set form values when pageData is loaded
  useEffect(() => {
    if (pageData?.data?.jsonData) {
      // For debugging
      console.log('Page data loaded:', pageData.data);
    }
  }, [pageData]);

  // Handle document array management
  const [documents, setDocuments] = useState(defaultValues.documents);
  
  const addDocument = () => {
    setDocuments([
      ...documents,
      {
        title: '',
        description: '',
        fileSize: '',
        fileType: '',
        downloadUrl: '',
      },
    ]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const isLoading = externalLoading || isLoadingPage || savePage.isPending;

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pageId ? 'Update Document Download Page' : 'Create Document Download Page'}
      schema={documentDownloadFormSchema}
      defaultValues={pageData?.data?.jsonData || defaultValues}
      onSubmit={(values) => {
        savePage.mutate(values);
      }}
      isLoading={isLoading}
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
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : index < currentStep
                      ? 'border-emerald-600 bg-white text-emerald-600'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className='w-4 h-4' /> : index + 1}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index === currentStep ? 'text-emerald-600 font-medium' : 'text-gray-500'
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
                      <FormLabel>
                        <Type className='w-4 h-4 inline mr-2' />
                        Page Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter page title'
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
                  name='subtitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Type className='w-4 h-4 inline mr-2' />
                        Subtitle
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter subtitle'
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
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Type className='w-4 h-4 inline mr-2' />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter page description'
                          className='min-h-[100px]'
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
                  name='buttonText'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Type className='w-4 h-4 inline mr-2' />
                        Button Text
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Download Documents'
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

            {/* Appearance */}
            {currentStep === 1 && (
              <div className='space-y-4 p-2'>
                <FormField
                  control={form.control}
                  name='bgImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <ImageIcon className='w-4 h-4 inline mr-2' />
                        Background Image URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/image.jpg'
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
                  name='accentColor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Palette className='w-4 h-4 inline mr-2' />
                        Accent Color
                      </FormLabel>
                      <FormControl>
                        <div className='flex items-center space-x-2'>
                          <Input
                            type='color'
                            className='w-12 h-10 p-1'
                            disabled={isLoading}
                            {...field}
                          />
                          <Input
                            placeholder='#059669'
                            disabled={isLoading}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='documentRequireForm'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                      <div className='space-y-0.5'>
                        <FormLabel>Require Form for Downloads</FormLabel>
                        <div className='text-sm text-muted-foreground'>
                          Visitors will need to fill out a form before downloading documents
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Documents */}
            {currentStep === 2 && (
              <div className='space-y-4 p-2'>
                <h3 className='text-lg font-medium'>Document List</h3>
                <p className='text-sm text-gray-500 mb-4'>
                  Add the documents you want to make available for download
                </p>

                {form.watch('documents')?.map((_, index) => (
                  <div key={index} className='border rounded-md p-4 mb-4 relative'>
                    <button
                      type='button'
                      className='absolute top-2 right-2 text-red-500 hover:text-red-700'
                      onClick={() => {
                        const currentDocs = form.getValues('documents');
                        const newDocs = currentDocs.filter((_, i) => i !== index);
                        form.setValue('documents', newDocs);
                      }}
                    >
                      ×
                    </button>
                    
                    <FormField
                      control={form.control}
                      name={`documents.${index}.title`}
                      render={({ field }) => (
                        <FormItem className='mb-2'>
                          <FormLabel>Document Title</FormLabel>
                          <FormControl>
                            <Input placeholder='Purchase Agreement' {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`documents.${index}.description`}
                      render={({ field }) => (
                        <FormItem className='mb-2'>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='A brief description of the document' 
                              {...field} 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className='grid grid-cols-2 gap-2'>
                      <FormField
                        control={form.control}
                        name={`documents.${index}.fileSize`}
                        render={({ field }) => (
                          <FormItem className='mb-2'>
                            <FormLabel>File Size</FormLabel>
                            <FormControl>
                              <Input placeholder='245 KB' {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`documents.${index}.fileType`}
                        render={({ field }) => (
                          <FormItem className='mb-2'>
                            <FormLabel>File Type</FormLabel>
                            <FormControl>
                              <Input placeholder='PDF' {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`documents.${index}.downloadUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder='https://example.com/documents/file.pdf' 
                              {...field} 
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    const currentDocs = form.getValues('documents') || [];
                    form.setValue('documents', [
                      ...currentDocs,
                      {
                        title: '',
                        description: '',
                        fileSize: '',
                        fileType: '',
                        downloadUrl: '',
                      }
                    ]);
                  }}
                  disabled={isLoading}
                >
                  + Add Document
                </Button>
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
                  name='agentTitle'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Real Estate Agent'
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
                  name='agentImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://example.com/agent.jpg'
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
                  name='contactInfo.address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <MapPin className='w-4 h-4 inline mr-2' />
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='123 Main St, Anytown, USA'
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
                  name='contactInfo.phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Phone className='w-4 h-4 inline mr-2' />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='(123) 456-7890'
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
                  name='contactInfo.email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Mail className='w-4 h-4 inline mr-2' />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='john.doe@example.com'
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

            {/* Social */}
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
                          placeholder='https://instagram.com/yourprofile'
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
                          placeholder='https://linkedin.com/in/yourprofile'
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
                          placeholder='https://twitter.com/yourhandle'
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
                          <div className='bg-gray-100 p-2 rounded text-gray-500 text-sm'>
                            {typeof window !== 'undefined' ? window.location.origin : ''}/p/
                          </div>
                          <Input
                            placeholder='your-document-page'
                            disabled={isLoading}
                            {...field}
                            onBlur={() => {
                              if (field.value) {
                                checkSlug.mutate(field.value);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      {!slugAvailable && field.value && !checkSlug.isPending && (
                        <p className='text-sm font-medium text-red-500 mt-1'>
                          This URL is already taken
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
                          onCheckedChange={field.onChange}
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
            </div>

            <div className='flex space-x-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={isLoading}
                  className='bg-emerald-600 hover:bg-emerald-700'
                >
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  type='submit'
                  disabled={isLoading || !form.formState.isValid || !slugAvailable}
                  className='bg-emerald-600 hover:bg-emerald-700 min-w-[100px]'
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
