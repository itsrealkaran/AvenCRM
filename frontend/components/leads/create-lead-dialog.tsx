'use client';

import { leadsApi } from '@/api/leads.service';
import { createLeadSchema } from '@/schema';
import { CreateLead, LeadStatus, PropertyType } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { BaseEntityDialog, CommonFormFields, NotesField } from '../entity-dialog';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function CreateLeadDialog({ open, onOpenChange, isLoading }: CreateLeadDialogProps) {
  const queryClient = useQueryClient();

  const createLead = useMutation({
    mutationFn: async (values: CreateLead) => {
      try {
        return await leadsApi.createLead(values);
      } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
      toast.success('Lead created successfully');
    },
    onError: () => {
      toast.error('Failed to create lead');
    },
  });

  const defaultValues: CreateLead = {
    name: '',
    email: '',
    phone: '',
    status: LeadStatus.NEW,
    source: '',
    propertyType: PropertyType.COMMERCIAL,
    budget: undefined,
    location: '',
    notes: [],
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Create New Lead'
      schema={createLeadSchema}
      defaultValues={defaultValues}
      onSubmit={(values) => {
        console.log('Submitting values:', values); // Log the values being submitted
        console.log('Submitting values:', JSON.stringify(values, null, 2)); // Log the values being submitted
        createLead.mutate(values);
      }}
      isLoading={isLoading}
    >
      {(form) => (
        <>
          <CommonFormFields form={form} isLoading={isLoading} />
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(LeadStatus).map((status) => (
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

            <FormField
              control={form.control}
              name='propertyType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
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
              name='budget'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter budget'
                      disabled={isLoading}
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
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter location' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='source'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter source' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <NotesField form={form} isLoading={isLoading} />

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
