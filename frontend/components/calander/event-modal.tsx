import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createEvent, deleteEvent, updateEvent } from './api';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSave: (eventData: any) => void;
  onDelete: (eventId: number) => void;
}

const formatDateForInput = (date: Date) => {
  return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          start: formatDateForInput(new Date(event.start)),
          end: formatDateForInput(new Date(event.end)),
        }
      : {},
  });

  console.log(event);
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (event && event.id) {
        await updateEvent(event.id, {
          ...data,
          id: event.id, // Make sure to include the ID
        });
        onSave({
          ...data,
          id: event.id,
        });
      } else {
        const newEvent = await createEvent(data);
        onSave(newEvent);
      }
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (event && event.id) {
      try {
        setLoading(true);
        await deleteEvent(event.id);
        onDelete(event.id);
        setLoading(false);
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
            <Button disabled={loading} type='submit'>
              {event && event.id
                ? 'Update Event'
                : loading
                  ? 'Updating...'
                  : loading
                    ? 'Creating...'
                    : 'Create Event'}
            </Button>
            {event && event.id && (
              <Button disabled={loading} type='button' variant='destructive' onClick={handleDelete}>
                {loading ? 'Deleting...' : 'Delete Event'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
