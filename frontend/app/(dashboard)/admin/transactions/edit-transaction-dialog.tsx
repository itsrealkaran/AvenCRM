'use client';

import { useEffect } from 'react';
import { dealsApi } from '@/api/deals.service';
import { Transaction } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  invoiceNumber: z.string().optional(),
  transactionMethod: z.string().optional(),
  date: z.string(),
  propertyType: z.string().optional(),
  hasPartner: z.boolean().default(false),
  partnerDetails: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      commissionRate: z.string().optional(),
    })
    .optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: EditTransactionDialogProps) {
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
        email: '',
        phone: '',
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

  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount.toString(),
        commissionRate: transaction.commissionRate?.toString() || '',
        transactionMethod: transaction.transactionMethod || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        propertyType: transaction.propertyType || '',
        hasPartner: !!transaction.partnerDetails,
        partnerDetails: transaction.partnerDetails
          ? {
              name: transaction.partnerDetails.name || '',
              email: transaction.partnerDetails.email || '',
              phone: transaction.partnerDetails.phone || '',
              commissionRate: transaction.partnerDetails.commissionRate?.toString() || '',
            }
          : undefined,
      });
    }
  }, [transaction, form]);

  const editTransaction = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      if (!transaction) {
        throw new Error('No transaction selected for editing');
      }

      try {
        const payload = {
          ...values,
          amount: parseFloat(values.amount),
          commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : null,
          date: new Date(values.date).toISOString(),
          partnerDetails:
            values.hasPartner && values.partnerDetails
              ? {
                  ...values.partnerDetails,
                  commissionRate: values.partnerDetails.commissionRate
                    ? parseFloat(values.partnerDetails.commissionRate)
                    : null,
                }
              : null,
        };

        const response = await api.put(`/transactions/${transaction.id}`, payload);
        return response.data;
      } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onOpenChange(false);
      form.reset();
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update transaction');
    },
  });

  function onSubmit(values: TransactionFormValues) {
    editTransaction.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
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
                      disabled={isWonDealsLoading}
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
                        disabled={editTransaction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} disabled={editTransaction.isPending} />
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
            </div>

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
              <div className='space-y-4'>
                <h3 className='font-medium'>Partner Details</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='partnerDetails.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Name</FormLabel>
                        <FormControl>
                          <Input placeholder='John Doe' {...field} />
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
                          <Input type='email' placeholder='john@example.com' {...field} />
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
                          <Input placeholder='+1234567890' {...field} />
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
                          <Input type='number' placeholder='5' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className='flex justify-end space-x-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={editTransaction.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={editTransaction.isPending} className='min-w-[100px]'>
                {editTransaction.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Transaction'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
