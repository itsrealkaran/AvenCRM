'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { BaseEntityFormProps } from './types';

export function BaseEntityDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  defaultValues,
  schema,
  children,
  isLoading,
}: BaseEntityFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[880px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {typeof children === 'function' ? children(form) : children}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
