'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DataTableFormProps<TData> {
  schema: z.ZodObject<any>;
  fields: {
    name: keyof TData;
    label: string;
    type: string;
    placeholder?: string;
  }[];
  onSubmit: (data: any) => Promise<void>;
  queryKey: string;
  onSuccess?: () => void;
}

export function DataTableForm<TData>({
  schema,
  fields,
  onSubmit,
  queryKey,
  onSuccess,
}: DataTableFormProps<TData>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name as string] = '';
      return acc;
    }, {} as any),
  });

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: 'Success',
        description: 'Record created successfully.',
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create record. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className='space-y-4'>
        {fields.map((field) => (
          <FormField
            key={field.name as string}
            control={form.control}
            name={field.name as string}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type={field.type} placeholder={field.placeholder} {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type='submit' className='w-full' disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
