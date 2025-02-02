'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface CoOwnersFieldProps {
  form: UseFormReturn<any>;
  isLoading?: boolean;
}

export function CoOwnersField({ form, isLoading }: CoOwnersFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'coOwners',
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <FormLabel>Co-Owners</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={() =>
            append({
              name: '',
              email: '',
              phone: '',
            })
          }
          disabled={isLoading}
        >
          <PlusCircle className='mr-2 h-4 w-4' />
          Add Co-Owner
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className='space-y-4 rounded-lg border p-4'>
          <div className='flex justify-end'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
              disabled={isLoading}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <FormField
              control={form.control}
              name={`coOwners.${index}.name`}
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
              name={`coOwners.${index}.email`}
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
              name={`coOwners.${index}.phone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder='+1234567890' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
