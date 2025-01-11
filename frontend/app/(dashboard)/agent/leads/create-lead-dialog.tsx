'use client';

import { LeadStatus, PropertyType } from '@/types';
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
  propertyType: z.enum(Object.values(PropertyType) as [PropertyType, ...PropertyType[]]),
  budget: z.string().optional(),
  location: z.string().optional(),
  notes: z.array(noteEntrySchema),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function CreateLeadDialog({ open, onOpenChange, isLoading }: CreateLeadDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: LeadStatus.NEW,
      source: '',
      propertyType: PropertyType.RESIDENTIAL,
      budget: '',
      location: '',
      leadAmount: '',
      notes: [{ time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), note: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notes',
  });

  const createLead = useMutation({
    mutationFn: async (values: LeadFormValues) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
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
        throw new Error(error || 'Failed to create lead');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
      form.reset();
      toast.success('Lead created successfully');
    },
    onError: () => {
      toast.error('Failed to create lead');
    },
  });

  function onSubmit(values: LeadFormValues) {
    createLead.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[880px]'>
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
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
                      <Input placeholder='John Doe' disabled={isLoading} {...field} />
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
                      <Input
                        type='email'
                        placeholder='john@example.com'
                        disabled={isLoading}
                        {...field}
                      />
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
                      <Input placeholder='+1 234 567 890' disabled={isLoading} {...field} />
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
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={isLoading}
                      >
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
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select Property Type' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PropertyType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4 max-h-[300px] overflow-y-auto p-3'>
              <div className='flex items-center justify-between'>
                <FormLabel>Notes</FormLabel>
                <div className='relative group'>
                  {/* <div className='absolute -left-20 top-8 w-48 bg-gray-700 text-white text-sm rounded p-2 shadow-lg opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100'>
                    Notes with the same time will be merged together.
                  </div> */}
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
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className='flex gap-4 items-start'>
                  <FormField
                    control={form.control}
                    name={`notes.${index}.time`}
                    render={({ field }) => (
                      <FormItem className='flex-shrink-0 w-60'>
                        <FormControl>
                          <Input type='datetime-local' {...field} />
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
                            className='resize-none'
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
                    className='flex-shrink-0'
                    onClick={() => remove(index)}
                  >
                    <Trash2 className='w-4 h-4 text-red-500' />
                  </Button>
                </div>
              ))}
            </div>

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
                {isLoading ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
