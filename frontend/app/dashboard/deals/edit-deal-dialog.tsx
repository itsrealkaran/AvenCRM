'use client';

import { useEffect } from 'react';
import { Deal } from '@/types/deals';
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
import { Textarea } from '@/components/ui/textarea';

const dealFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  dealAmount: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  propertyType: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  expectedCloseDate: z.date(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

interface EditDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => Promise<void>;
  deal: Deal | null;
}

export function EditDealDialog({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  deal,
}: EditDealDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      status: '',
      source: '',
      expectedCloseDate: new Date(),
    },
  });

  useEffect(() => {
    if (deal) {
      form.reset({
        name: deal.name,
        email: deal.email || '',
        phone: deal.phone || '',
        dealAmount: deal.dealAmount?.toString() || '',
        status: deal.status || '',
        source: deal.source || '',
        propertyType: deal.propertyType || '',
        budget: deal.budget?.toString() || '',
        location: deal.location || '',
        notes: deal.notes || '',
        expectedCloseDate: new Date(deal.expectedCloseDate ?? Date.now()),
      });
    }
  }, [deal, form]);

  const editDeal = useMutation({
    mutationFn: async (values: DealFormValues) => {
      debugger;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals/${deal?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update deal');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      form.reset();
      toast.success('Deal updated successfully');
    },
    onError: () => {
      toast.error('Failed to update deal');
    },
  });

  function onSubmit(values: DealFormValues) {
    editDeal.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
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
                      <Input type='email' placeholder='john@example.com' {...field} />
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
                      <Input placeholder='+1 234 567 890' {...field} />
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
                      <Input type='number' placeholder='10000' {...field} />
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
                    <FormControl>
                      <Input placeholder='Status' {...field} />
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
                    <FormControl>
                      <Input placeholder='Residential' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Add any additional notes here...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end space-x-4'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit'>Update Deal</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
