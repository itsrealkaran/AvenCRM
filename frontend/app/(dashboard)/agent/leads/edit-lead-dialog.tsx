'use client';

import { useEffect } from 'react';
import { Lead, LeadStatus } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
});

const leadFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  leadAmount: z.string().optional(),
  status: z.enum(Object.values(LeadStatus) as [LeadStatus, ...LeadStatus[]]),
  source: z.string().optional(),
  propertyType: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  notes: z.array(noteEntrySchema),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => Promise<void>;
  lead: Lead | null;
}

export function EditLeadDialog({
  open,
  onOpenChange,
  onEdit,
  onDelete,
  lead,
}: EditLeadDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      status: LeadStatus.NEW,
      source: '',
      notes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notes',
  });

  useEffect(() => {
    if (lead) {
      const notesArray = lead.notes
        ? Object.entries(lead.notes)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([time, note]) => ({ time, note }))
        : [{ time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), note: '' }];

      form.reset({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        leadAmount: lead.leadAmount?.toString() || '',
        status: lead.status || LeadStatus.NEW,
        source: lead.source || '',
        propertyType: lead.propertyType || '',
        budget: lead.budget?.toString() || '',
        location: lead.location || '',
        notes: notesArray,
      });
    }
  }, [lead, form]);

  const editLead = useMutation({
    mutationFn: async (values: LeadFormValues) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/${lead?.id}`, {
        method: 'PUT',
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
        throw new Error(error || 'Failed to update lead');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
      form.reset();
      toast.success('Lead updated successfully');
    },
    onError: () => {
      toast.error('Failed to update lead');
    },
  });

  function onSubmit(values: LeadFormValues) {
    editLead.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[880px]'>
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
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
                      <Select {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Status' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(LeadStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
              <Button type='submit'>Update Lead</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
