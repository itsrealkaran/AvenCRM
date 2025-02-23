'use client';

import { useEffect, useState } from 'react';
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

import { BaseEntityDialog, CommonFormFields, CoOwnersField, NotesField } from '../entity-dialog';

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      await queryClient.refetchQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      toast.success('Deal updated successfully');
    },
    onError: (error) => {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    },
  });

  if (!deal) return null;

  const defaultValues = {
    ...deal,
    expectedCloseDate: deal.expectedCloseDate
      ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
      : null,
    actualCloseDate: deal.actualCloseDate
      ? new Date(deal.actualCloseDate).toISOString().split('T')[0]
      : null,
  };

  const handleSubmit = async (values: UpdateDeal) => {
    await updateDeal.mutateAsync(values);
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
          <div className='space-y-4'>
            <div className='h-[50vh] overflow-y-auto pr-2'>
              <div className='grid grid-cols-2 gap-4 p-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter name'
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
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter email'
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
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter phone'
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
                  name='propertyAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter property address'
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
                  name='propertyValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Value</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter property value'
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
                  name='dealAmount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Amount</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter deal amount'
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
                  name='estimatedCommission'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Commission</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Enter estimated commission'
                          disabled={updateDeal.isPending}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes and Co-owners */}
              <div className='space-y-4'>
                <NotesField form={form} isLoading={updateDeal.isPending} />
                <CoOwnersField form={form} isLoading={updateDeal.isPending} />
              </div>
            </div>

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                disabled={updateDeal.isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                form={form.id}
                type='submit'
                disabled={updateDeal.isPending}
                className='min-w-[100px]'
              >
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
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
