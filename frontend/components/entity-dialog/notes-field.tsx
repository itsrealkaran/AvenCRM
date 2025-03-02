'use client';

import { format } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

import { AITextarea } from '../ui/ai-textarea';

interface NotesFieldProps {
  form: UseFormReturn<any>;
  isLoading?: boolean;
}

export function NotesField({ form, isLoading }: NotesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'notes',
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <FormLabel>Notes</FormLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8'
          onClick={() =>
            append({
              time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              note: '',
            })
          }
          disabled={isLoading}
        >
          <PlusCircle className='mr-2 h-4 w-4' />
          Add Note
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className='flex gap-2'>
          <FormField
            control={form.control}
            name={`notes.${index}.note`}
            render={({ field }) => (
              <FormItem className='flex-1'>
                <FormControl>
                  <AITextarea
                    placeholder='Add a note...'
                    className='resize-none'
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => remove(index)}
            disabled={isLoading}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ))}
    </div>
  );
}
