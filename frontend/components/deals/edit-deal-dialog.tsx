'use client';

import { useState } from 'react';
import { dealsApi } from '@/api/deals.service';
import { updateDealSchema } from '@/schema/deal.schema';
import { DealStatus, PropertyType, UpdateDeal } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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

interface EditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: UpdateDeal | null;
}

export function EditDealDialog({ open, onOpenChange, deal }: EditDealDialogProps) {
  const queryClient = useQueryClient();
  const updateDeal = useMutation({
    mutationFn: async (values: UpdateDeal) => {
      if (!deal?.id) throw new Error('Deal ID is required');
      return dealsApi.updateDeal(deal.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      toast.success('Deal updated successfully');
    },
    onError: (error) => {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    },
  });

  if (!deal) return null;

  const defaultValues: UpdateDeal = {
    id: deal.id,
    name: deal.name,
    email: deal.email ?? '',
    phone: deal.phone ?? '',
    status: deal.status,
    dealAmount: deal.dealAmount,
    propertyAddress: deal.propertyAddress ?? '',
    propertyValue: deal.propertyValue ?? 0,
    propertyType: deal.propertyType,
    notes: deal.notes ?? [],
    commissionRate: deal.commissionRate ?? 0,
    expectedCloseDate:
      typeof deal.expectedCloseDate === 'string'
        ? new Date(deal.expectedCloseDate)
        : deal.expectedCloseDate,
  };

  const handleSubmit = async (values: UpdateDeal) => {
    try {
      await updateDeal.mutateAsync(values);
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    }
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Deal'
      schema={updateDealSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isLoading={updateDeal.isPending}
    >
      {(form) => (
        <>
          <CommonFormFields form={form} isLoading={updateDeal.isPending} />
          {/* <div className='space-y-1 bg-red-200 text-red-800 p-4'>
            Errors: <p>{JSON.stringify(form.formState.errors, null, 2)}</p>
            Values: <p>{JSON.stringify(form.getValues(), null, 2)}</p>
            Watch: <p>{JSON.stringify(form.watch(), null, 2)}</p>
            Form Valid: <p>{form.formState.isValid ? 'true' : 'false'}</p>
          </div> */}
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status 7</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={updateDeal.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DealStatus).map((status) => (
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
                    disabled={updateDeal.isPending}
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
                      disabled={updateDeal.isPending}
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
                      disabled={updateDeal.isPending}
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
                    <Input placeholder='Enter source' disabled={updateDeal.isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <NotesField form={form} isLoading={updateDeal.isPending} />

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              disabled={updateDeal.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={updateDeal.isPending} className='min-w-[100px]'>
              {updateDeal.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Deal'
              )}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
