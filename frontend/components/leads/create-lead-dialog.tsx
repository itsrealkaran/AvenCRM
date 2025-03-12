'use client';

import { useEffect } from 'react';
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
    source: 'Manual',
    role: 'BUY',
    propertyType: PropertyType.RESIDENTIAL,
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
        createLead.mutate(values);
      }}
      isLoading={isLoading}
    >
      {(form) => {
        return (
          <>
            <div className='h-[50vh] overflow-y-auto pr-2'>
              <div className='grid grid-cols-2 gap-4 p-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter name' disabled={isLoading} {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter email' disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select client type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={'BUY'}>Buy</SelectItem>
                              <SelectItem value={'SELL'}>Sell</SelectItem>
                              <SelectItem value={'RENT'}>Rent</SelectItem>
                              <SelectItem value={'NOT_LISTED'}>Not Listed</SelectItem>
                              <SelectItem value={'LISTED'}>Listed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter phone' disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
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
                                {type.charAt(0).toUpperCase() + type.toLowerCase().slice(1)}
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
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            disabled={isLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select lead status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={LeadStatus.NEW}>New</SelectItem>
                              <SelectItem value={LeadStatus.CONTACTED}>Discovery</SelectItem>
                              <SelectItem value={LeadStatus.NEGOTIATION}>Negotiation</SelectItem>
                              <SelectItem value={LeadStatus.WON}>Won</SelectItem>
                              <SelectItem value={LeadStatus.FOLLOWUP}>Follow Up</SelectItem>
                              <SelectItem value={LeadStatus.QUALIFIED}>Qualified</SelectItem>
                            </SelectContent>
                          </Select>
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
                </div>
              </div>

              {/* Notes Field - Full Width */}
              <div className='mt-4'>
                <NotesField form={form} isLoading={isLoading} />
              </div>
            </div>

            <div className='flex justify-end space-x-4 mt-4'>
              <Button
                type='button'
                variant='outline'
                disabled={createLead.isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={createLead.isPending || !form.formState.isValid}
                className='min-w-[100px]'
              >
                {createLead.isPending ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </>
        );
      }}
    </BaseEntityDialog>
  );
}
