'use client';

import { dealsApi } from '@/api/deals.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { api } from '@/lib/api';

const transactionFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  commissionRate: z.string().optional(),
  transactionMethod: z.string().optional(),
  date: z.string(),
  propertyType: z.string().optional(),
  hasPartner: z.boolean().default(false),
  partnerDetails: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    commissionRate: z.string().optional(),
  }).optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTransactionDialog({ open, onOpenChange }: CreateTransactionDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: '',
      commissionRate: '',
      transactionMethod: '',
      date: new Date().toISOString().split('T')[0],
      propertyType: '',
      hasPartner: false,
      partnerDetails: {
        name: '',
        phone: '',
        email: '',
        commissionRate: '',
      },
    },
  });

  const { data: wonDealsData, isLoading: isWonDealsLoading } = useQuery({
    queryKey: ['wonDeals'],
    queryFn: async () => {
      const response = await dealsApi.getAllWonDeals();
      return response;
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      try {
        const payload = {
          ...values,
          amount: parseFloat(values.amount),
          commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : 0,
          date: new Date(values.date).toISOString(),
          partner: values.hasPartner ? {
            name: values.partnerDetails?.name,
            phone: values.partnerDetails?.phone,
            email: values.partnerDetails?.email,
            commissionRate: values.partnerDetails?.commissionRate ? parseFloat(values.partnerDetails.commissionRate) : 0,
          } : null,
        };

        console.log('Transaction payload:', JSON.stringify(payload, null, 2));
        const response = await api.post('/transactions', payload);
        return response.data;
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onOpenChange(false);
      form.reset();
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction');
    },
  });

  function onSubmit(values: TransactionFormValues) {
    createTransaction.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      disabled={createTransaction.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a deal' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wonDealsData &&
                          wonDealsData.map((deal: any) => (
                            <SelectItem key={deal.id} value={deal.dealAmount.toString()}>
                              {deal.name} - ${deal.dealAmount.toLocaleString()}
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
                name='commissionRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='10'
                        {...field}
                        disabled={createTransaction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='transactionMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={createTransaction.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='CARD'>Card</SelectItem>
                        <SelectItem value='BANK_TRANSFER'>Bank Transfer</SelectItem>
                        <SelectItem value='CASH'>Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} disabled={createTransaction.isPending} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select property type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='BUY'>Buy</SelectItem>
                        <SelectItem value='SELL'>Sell</SelectItem>
                        <SelectItem value='RENT'>Rent</SelectItem>
                        <SelectItem value='NOT_LISTED'>Not Listed</SelectItem>
                        <SelectItem value='LISTED'>Listed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hasPartner'
                render={({ field }) => (
                  <FormItem className='col-span-2 flex items-center space-x-2'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className='h-4 w-4 rounded border-gray-300'
                      />
                    </FormControl>
                    <FormLabel className='!mt-0'>Add Partner</FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('hasPartner') && (
                <>
                  <FormField
                    control={form.control}
                    name='partnerDetails.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter partner name'
                            {...field}
                            disabled={createTransaction.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='partnerDetails.phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter partner phone'
                            {...field}
                            disabled={createTransaction.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='partnerDetails.email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Enter partner email'
                            {...field}
                            disabled={createTransaction.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='partnerDetails.commissionRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Commission Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Enter partner commission rate'
                            {...field}
                            disabled={createTransaction.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={createTransaction.isPending}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={createTransaction.isPending || !form.formState.isValid}
                className='min-w-[100px]'
              >
                {createTransaction.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Transaction'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
