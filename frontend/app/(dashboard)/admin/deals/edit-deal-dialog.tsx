'use client';

import { useEffect } from 'react';
import { dealsApi } from '@/services/deals';
import { Deal, DealStatus } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
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

const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
});

const dealFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  dealAmount: z.string().optional(),
  status: z.nativeEnum(DealStatus),
  propertyType: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyValue: z.string().optional(),
  expectedCloseDate: z.date().optional(),
  actualCloseDate: z.date().optional(),
  commissionRate: z.string().optional(),
  estimatedCommission: z.string().optional(),
  notes: z.array(noteEntrySchema),
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
      status: DealStatus.NEW_DISCOVERY,
      notes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notes',
  });

  useEffect(() => {
    if (deal) {
      const notesArray = deal.notes
        ? Object.entries(deal.notes)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([time, note]) => ({ time, note }))
        : [{ time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), note: '' }];

      form.reset({
        name: deal.name,
        email: deal.email || '',
        phone: deal.phone || '',
        dealAmount: deal.dealAmount?.toString() || '',
        status: deal.status,
        propertyType: deal.propertyType || '',
        propertyAddress: deal.propertyAddress || '',
        propertyValue: deal.propertyValue?.toString() || '',
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : undefined,
        actualCloseDate: deal.actualCloseDate ? new Date(deal.actualCloseDate) : undefined,
        commissionRate: deal.commissionRate?.toString() || '',
        estimatedCommission: deal.estimatedCommission?.toString() || '',
        notes: notesArray,
      });
    }
  }, [deal, form]);

  const editDeal = useMutation({
    mutationFn: async (values: DealFormValues) => {
      if (!deal?.id) throw new Error('Deal ID is required');

      const formattedValues = {
        ...values,
        dealAmount: values.dealAmount ? parseFloat(values.dealAmount) : undefined,
        propertyValue: values.propertyValue ? parseFloat(values.propertyValue) : undefined,
        commissionRate: values.commissionRate ? parseFloat(values.commissionRate) : undefined,
        estimatedCommission: values.estimatedCommission
          ? parseFloat(values.estimatedCommission)
          : undefined,
        notes: values.notes.reduce(
          (acc, { time, note }) => {
            if (note.trim()) {
              acc[time] = note;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      return dealsApi.updateDeal(deal.id, formattedValues);
    },
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      form.reset();
      toast.success('Deal updated successfully');
      onEdit(updatedDeal);
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
      <DialogContent className='sm:max-w-[880px]'>
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        {...field}
                      >
                        {Object.values(DealStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='10000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4 max-h-[300px] overflow-y-auto p-3 rounded-lg border bg-slate-50/50'>
              <div className='flex items-center justify-between sticky top-0 bg-white p-2 rounded-md shadow-sm'>
                <FormLabel className='text-lg font-semibold'>Notes Timeline</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    append({ time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), note: '' })
                  }
                >
                  <PlusCircle className='w-4 h-4 mr-2' />
                  Add Note
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='flex gap-4 items-start p-3 bg-white rounded-lg shadow-sm'
                >
                  <FormField
                    control={form.control}
                    name={`notes.${index}.time`}
                    render={({ field }) => (
                      <FormItem className='flex-shrink-0 w-60'>
                        <FormControl>
                          <Input type='datetime-local' {...field} className='text-sm' />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`notes.${index}.note`}
                    render={({ field }) => (
                      <FormItem className='flex-grow'>
                        <FormControl>
                          <Textarea
                            placeholder='Enter note...'
                            className='resize-none min-h-[80px] text-sm'
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='flex-shrink-0 hover:bg-red-50 hover:text-red-600'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='w-4 h-4 text-red-500' />
                  </Button>
                </div>
              ))}
            </div>

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
