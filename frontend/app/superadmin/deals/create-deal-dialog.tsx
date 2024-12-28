'use client';

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
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  companyId: z.string(),
  agentId: z.string(),
  dealAmount: z.string(),
  status: z.enum([
    'NEW_DISCOVERY',
    'PROSPECT',
    'ACTIVE',
    'UNDER_CONTRACT',
    'CLOSED_WON',
    'CLOSED_LOST',
  ]),
  propertyType: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyValue: z.number().optional(),
  expectedCloseDate: z.date().optional(),
  actualCloseDate: z.date().optional(),
  commissionRate: z.number().optional(),
  estimatedCommission: z.number().optional(),
  notes: noteEntrySchema.array(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function CreateDealDialog({ open, onOpenChange, isLoading }: CreateDealDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      phone: '',
      companyId: '',
      agentId: '',
      dealAmount: '',
      status: DealStatus.NEW_DISCOVERY,
      propertyType: '',
      propertyAddress: '',
      propertyValue: undefined,
      expectedCloseDate: undefined,
      actualCloseDate: undefined,
      commissionRate: undefined,
      estimatedCommission: undefined,
      notes: [{ time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), note: '' }],
      createdAt: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notes',
  });

  const createDeal = useMutation({
    mutationFn: async (values: DealFormValues) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...values,
          notes: values.notes.reduce(
            (acc, { time, note }) => {
              if (note.trim()) {
                if (acc[time]) {
                  acc[time] += `\n\n${note}`; // Merge notes with a gap
                } else {
                  acc[time] = note;
                }
              }
              return acc;
            },
            {} as Record<string, string>
          ),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create deal');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      form.reset();
      toast.success('Deal created successfully');
    },
    onError: () => {
      toast.error('Failed to create deal');
    },
  });

  function onSubmit(values: DealFormValues) {
    const formattedValues = {
      ...values,
      notes: values.notes.filter(({ note }) => note.trim() !== ''),
    };
    createDeal.mutate(formattedValues);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[880px]'>
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
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
                      <Input placeholder='Status' {...field} />
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
              <FormField
                control={form.control}
                name='expectedCloseDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
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
              <Button type='submit'>Create Deal</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
