'use client';

import { dealsApi } from '@/api/deals.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
          commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : null,
          date: new Date(values.date).toISOString(),
        };

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
                    <FormLabel>Commsission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='10' {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex justify-end space-x-4'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit'>Create Transaction</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
