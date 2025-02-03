'use client';

import { dealsApi } from '@/api/deals.service';
import { createDealSchema } from '@/schema/deal.schema';
import { CreateDeal, DealStatus, PropertyType } from '@/types';
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
          <CommonFormFields form={form} isLoading={isLoading} />

          {/* <div className='space-y-1 bg-red-200 text-red-800 p-4'>
            Errors: <p>{JSON.stringify(form.formState.errors, null, 2)}</p>
            Values: <p>{JSON.stringify(form.getValues(), null, 2)}</p>
            Watch: <p>{JSON.stringify(form.watch(), null, 2)}</p>
            Form Valid: <p>{form.formState.isValid ? 'true' : 'false'}</p>
          </div> */}

          <div className='grid grid-cols-2 gap-4'>
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
            {/* <FormField
              control={form.control}
              name="expectedCloseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Close Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isLoading}
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="actualCloseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Close Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isLoading}
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter commission rate"
                      disabled={isLoading}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
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

          <NotesField form={form} isLoading={isLoading} />
          <CoOwnersField form={form} isLoading={isLoading} />

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
              {isLoading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </>
      )}
    </BaseEntityDialog>
  );
}
