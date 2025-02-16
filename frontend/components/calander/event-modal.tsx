import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

import { createEvent, deleteEvent, updateEvent } from './api';
import { eventColors } from './event-utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSave: (eventData: any) => void;
  onDelete: (eventId: string | number) => void;
}

interface EventFormData {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  color?: string;
}

const formatDateForInput = (date: Date) => {
  return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
};

const parseEventDates = (data: EventFormData) => {
  return {
    ...data,
    start: new Date(data.start),
    end: new Date(data.end),
  };
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EventFormData>({
    defaultValues: event
      ? {
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          start: formatDateForInput(new Date(event.start)),
          end: formatDateForInput(new Date(event.end)),
          color: event.color || 'blue',
        }
      : {
          title: '',
          description: '',
          location: '',
          start: formatDateForInput(new Date()),
          end: formatDateForInput(new Date(Date.now() + 3600000)),
          color: 'blue',
        },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      reset({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        start: formatDateForInput(new Date(event.start)),
        end: formatDateForInput(new Date(event.end)),
        color: event.color || 'blue',
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);
      const eventData = parseEventDates(data);

      if (event?.id) {
        // Preserve the source and IDs when updating
        onSave({
          ...eventData,
          id: event.id,
          source: event.source,
          googleEventId: event.googleEventId,
          color: data.color,
        });
      } else {
        // New event
        onSave({
          ...eventData,
          color: data.color,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
      reset();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (event?.id) {
      try {
        setLoading(true);
        onDelete(event.id);
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setLoading(false);
        reset();
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className='sm:max-w-[540px]'>
        <DialogHeader>
          <DialogTitle>
            {event?.id
              ? `Edit Event${event.source === 'google' ? ' (Google Calendar)' : ''}`
              : 'Create Event'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              {...register('title', { required: 'Title is required' })}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
          </div>
          <div>
            <Label htmlFor='start'>Start Date</Label>
            <Input
              id='start'
              type='datetime-local'
              {...register('start', { required: 'Start date is required' })}
              className={errors.start ? 'border-red-500' : ''}
            />
            {errors.start && <p className='text-red-500 text-sm mt-1'>{errors.start.message}</p>}
          </div>
          <div>
            <Label htmlFor='end'>End Date</Label>
            <Input
              id='end'
              type='datetime-local'
              {...register('end', {
                required: 'End date is required',
                validate: (value, formValues) =>
                  new Date(value) > new Date(formValues.start) ||
                  'End date must be after start date',
              })}
              className={errors.end ? 'border-red-500' : ''}
            />
            {errors.end && <p className='text-red-500 text-sm mt-1'>{errors.end.message}</p>}
          </div>
          <div>
            <Label htmlFor='color'>Event Color</Label>
            <RadioGroup
              defaultValue={watch('color')}
              onValueChange={(value) => setValue('color', value)}
              className='grid grid-cols-5 gap-4 mt-2'
            >
              {eventColors.map((color) => (
                <div key={color.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={color.id} id={color.id} className='peer sr-only' />
                  <Label
                    htmlFor={color.id}
                    className='flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'
                  >
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: color.backgroundColor }}
                    />
                    <span className='text-sm font-medium'>{color.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className='flex justify-between'>
            <Button type='submit' disabled={loading} className='bg-blue-600 hover:bg-blue-700'>
              {loading ? 'Saving...' : event?.id ? 'Update Event' : 'Create Event'}
            </Button>
            {event?.id && (
              <Button type='button' variant='destructive' onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Event'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
