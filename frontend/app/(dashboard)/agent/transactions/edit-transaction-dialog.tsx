'use client';

import { useEffect } from 'react';
import { Transaction } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  type: z.string().min(1, 'Payment type is required'),
  planType: z.string().optional(),
  invoiceNumber: z.string().optional(),
  taxRate: z.string().optional(),
  transactionMethod: z.string().optional(),
  receiptUrl: z.string().optional(),
  date: z.string(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => Promise<void>;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: EditTransactionDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: '',
      type: '',
      planType: '',
      invoiceNumber: '',
      taxRate: '',
      transactionMethod: '',
      receiptUrl: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount.toString(),
        type: transaction.type,
        planType: transaction.planType || '',
        invoiceNumber: transaction.invoiceNumber || '',
        taxRate: transaction.taxRate?.toString() || '',
        transactionMethod: transaction.transactionMethod || '',
        receiptUrl: transaction.receiptUrl || '',
        date: new Date(transaction.date).toISOString().split('T')[0],
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
          taxRate: values.taxRate ? parseFloat(values.taxRate) : null,
          date: new Date(values.date).toISOString(),
        };

        const response = await api.put(`/transactions/${transaction.id}`, payload);
        return response.data;
      } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
      }
    },
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onOpenChange(false);
      onEdit(updatedTransaction);
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
                    <FormControl>
                      <Input type='number' placeholder='1000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select payment type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='CREDIT'>Credit</SelectItem>
                        <SelectItem value='DEBIT'>Debit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='planType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select plan type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='FREE'>Free</SelectItem>
                        <SelectItem value='BASIC'>Basic</SelectItem>
                        <SelectItem value='PRO'>Pro</SelectItem>
                        <SelectItem value='ENTERPRISE'>Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='invoiceNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder='INV-001' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='taxRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
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
            </div>
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
            <div className='flex justify-end space-x-4'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit'>Update Transaction</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
