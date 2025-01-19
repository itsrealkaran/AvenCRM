'use client';

import { useRef, useState } from 'react';
import { propertiesApi } from '@/api/property.service';
import { createPropertySchema } from '@/schema/property.schema';
import { CreateProperty, PropertyStatus, PropertyType } from '@/types/property';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import DocumentUpload from '../documents/document-upload';

interface CreatePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePropertyDialog({ open, onOpenChange }: CreatePropertyDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const form = useForm({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      sqft: 0,
      address: '',
      propertyType: PropertyType.RESIDENTIAL,
      status: PropertyStatus.ACTIVE,
      bedrooms: 0,
      bathrooms: 0,
      location: '',
      amenities: [],
    },
  });

  const createProperty = useMutation({
    mutationFn: async (data: CreateProperty) => {
      return propertiesApi.createProperty(data, selectedFiles);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onOpenChange(false);
      form.reset();
      toast.success('Property created successfully');
    },
    onError: () => {
      toast.error('Failed to create property');
    },
  });

  const onSubmit = (data: CreateProperty) => {
    createProperty.mutate(data);
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Property</DialogTitle>
          <DialogDescription>Add a new property to your listings</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* <div className='space-y-1 bg-red-200 text-red-800 p-4'>
              Errors: <p>{JSON.stringify(form.formState.errors, null, 2)}</p>
              Values: <p>{JSON.stringify(form.getValues(), null, 2)}</p>
              Watch: <p>{JSON.stringify(form.watch(), null, 2)}</p>
              Form Valid: <p>{form.formState.isValid ? 'true' : 'false'}</p>
            </div> */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter property title' {...field} />
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
                    <Textarea placeholder='Enter property description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter budget'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sqft'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square Feet</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter square feet'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter property address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='propertyType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select property type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PropertyType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(PropertyStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='bedrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter budget'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='bathrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Baths</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Number of Full Bathrooms'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Documents</h3>
              <DocumentUpload
                onFilesChange={handleFilesChange}
                existingFiles={[]}
                disabled={false}
              />
            </div>
            <DialogFooter>
              <Button type='submit' disabled={createProperty.isPending}>
                {createProperty.isPending ? 'Creating...' : 'Create Property'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
