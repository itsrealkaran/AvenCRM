'use client';

import { dealsApi } from '@/api/deals.service';
import { createDealSchema } from '@/schema/deal.schema';
import { CreateDeal, DealStatus, PropertyType } from '@/types';
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

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function CreateDealDialog({ open, onOpenChange, isLoading }: CreateDealDialogProps) {
  const queryClient = useQueryClient();

  const createDeal = useMutation({
    mutationFn: async (values: CreateDeal) => {
      try {
        return await dealsApi.createDeal(values);
      } catch (error) {
        console.error('Error creating deal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      toast.success('Deal created successfully');
    },
    onError: () => {
      toast.error('Failed to create deal');
    },
  });

  const defaultValues: CreateDeal = {
    name: '',
    email: '',
    phone: '',
    status: DealStatus.NEW,
    dealAmount: 0,
    propertyType: PropertyType.COMMERCIAL,
    propertyValue: 0,
    propertyAddress: '',
    expectedCloseDate: new Date(),
    actualCloseDate: new Date(),
    commissionRate: 0,
    estimatedCommission: 0,
    notes: [],
    coOwners: [],
  };

  return (
    <BaseEntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Create New Deal'
      schema={createDealSchema}
      defaultValues={defaultValues}
      onSubmit={(values) => createDeal.mutate(values)}
      isLoading={isLoading}
    >
      {(form) => (
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
              disabled={createDeal.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={createDeal.isPending || !form.formState.isValid}
              className='min-w-[100px]'
            >
              {createDeal.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Deal'
              )}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
