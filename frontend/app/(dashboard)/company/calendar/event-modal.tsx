import React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createEvent, deleteEvent, updateEvent } from './api';

export default function EventModal({ isOpen, onClose, event, mutate }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
        }
      : {},
  });

  const onSubmit = async (data: any) => {
    try {
      if (event && event.id) {
        await updateEvent(event.id, data);
      } else {
        await createEvent(data);
      }
      mutate();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (event && event.id) {
      try {
        await deleteEvent(event.id);
        mutate();
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[540px]'>
        <DialogHeader>
          <DialogTitle>{event && event.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' {...register('title', { required: 'Title is required' })} />
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea id='description' {...register('description')} />
          </div>
          <div>
            <Label htmlFor='start'>Start Date</Label>
            <Input
              id='start'
              type='datetime-local'
              {...register('start', { required: 'Start date is required' })}
            />
          </div>
          <div>
            <Label htmlFor='end'>End Date</Label>
            <Input
              id='end'
              type='datetime-local'
              {...register('end', { required: 'End date is required' })}
            />
          </div>
          <div className='flex justify-between'>
            <Button type='submit'>{event && event.id ? 'Update Event' : 'Create Event'}</Button>
            {event && event.id && (
              <Button type='button' variant='destructive' onClick={handleDelete}>
                Delete Event
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
