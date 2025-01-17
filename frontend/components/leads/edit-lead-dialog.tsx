'use client';

import { useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { updateLeadSchema } from '@/schema';
import { LeadStatus, PropertyType, UpdateLead } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

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

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: z.infer<typeof updateLeadSchema> | null;
}

export function EditLeadDialog({ open, onOpenChange, lead }: EditLeadDialogProps) {
  const queryClient = useQueryClient();

  const updateLead = useMutation({
    mutationFn: async (values: UpdateLead) => {
      if (!lead?.id) throw new Error('Lead ID is required');
      return leadsApi.updateLead(lead.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    },
  });

  if (!lead) return null;

  const defaultValues: UpdateLead = {
    id: lead.id,
    name: lead.name,
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    status: lead.status,
    source: lead.source ?? '',
    propertyType: lead.propertyType,
    budget: lead.budget ?? 0,
    location: lead.location ?? '',
    expectedDate:
      typeof lead.expectedDate === 'string' ? new Date(lead.expectedDate) : lead.expectedDate,
    lastContactDate:
      typeof lead.lastContactDate === 'string'
        ? new Date(lead.lastContactDate)
        : lead.lastContactDate,
  };

  const handleSubmit = async (values: UpdateLead) => {
    try {
      await updateLead.mutateAsync(values);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Lead'
      schema={updateLeadSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={updateLead.isPending}
    >
      {(form) => (
        <>
          <CommonFormFields form={form} isLoading={updateLead.isPending} />
          <div className='space-y-1 bg-red-200 text-red-800 p-4'>
            Errors: <p>{JSON.stringify(form.formState.errors, null, 2)}</p>
            Values: <p>{JSON.stringify(form.getValues(), null, 2)}</p>
            Watch: <p>{JSON.stringify(form.watch(), null, 2)}</p>
            Form Valid: <p>{form.formState.isValid ? 'true' : 'false'}</p>
          </div>
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
                    disabled={updateLead.isPending}
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
                    disabled={updateLead.isPending}
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
                      disabled={updateLead.isPending}
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
                    <Input
                      placeholder='Enter location'
                      disabled={updateLead.isPending}
                      {...field}
                    />
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
                    <Input placeholder='Enter source' disabled={updateLead.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <NotesField form={form} isLoading={updateLead.isPending} />

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              disabled={updateLead.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={updateLead.isPending} className='min-w-[100px]'>
              {updateLead.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Lead'
              )}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
