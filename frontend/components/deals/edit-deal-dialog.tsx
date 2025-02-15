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
        <DealForm
          form={form}
          deal={deal}
          isLoading={updateDeal.isPending}
          onOpenChange={onOpenChange}
        />
      )}
    </BaseEntityDialog>
  );
}

function DealForm({
  form,
  deal,
  isLoading,
  onOpenChange,
}: {
  form: any;
  deal: UpdateDeal | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useEffect(() => {
    if (deal) {
      form.reset({
        name: deal.name,
        email: deal.email || '',
        phone: deal.phone || '',
        status: deal.status,
        dealAmount: deal.dealAmount,
        propertyType: deal.propertyType,
        propertyValue: deal.propertyValue || 0,
        propertyAddress: deal.propertyAddress || '',
        expectedCloseDate: deal.expectedCloseDate
          ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
          : '',
        actualCloseDate: deal.actualCloseDate
          ? new Date(deal.actualCloseDate).toISOString().split('T')[0]
          : '',
        commissionRate: deal.commissionRate || 0,
        estimatedCommission: deal.estimatedCommission || 0,
        notes: deal.notes || [],
        coOwners: deal.coOwners || [],
      });
    }
  }, [deal, form]);

  return (
    <>
      <div className='h-[50vh] overflow-y-auto pr-2'>
        <div className='grid grid-cols-2 gap-4 p-2'>
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
            name='propertyAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input placeholder='Enter property address' disabled={isLoading} {...field} />
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
            name='dealAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Amount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter deal amount'
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
            name='estimatedCommission'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Commission</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter estimated commission'
                    disabled={isLoading}
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
          <NotesField form={form} isLoading={isLoading} />
          <CoOwnersField form={form} isLoading={isLoading} />
        </div>
      </div>

      <div className='flex justify-end space-x-4 mt-4'>
        <Button
          type='button'
          variant='outline'
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading} className='min-w-[100px]'>
          {isLoading ? (
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
  );
}
