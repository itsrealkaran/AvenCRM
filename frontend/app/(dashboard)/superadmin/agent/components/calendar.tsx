'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Event = {
  id: number;
  title: string;
  date: Date;
  type: string;
  description: string;
};

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date(),
    type: '',
    description: '',
  });

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.type) {
      setEvents([...events, { ...newEvent, id: events.length + 1 }]);
      setNewEvent({ title: '', date: new Date(), type: '', description: '' });
    }
  };

  const eventsForSelectedDate = events.filter(
    (event) => event.date.toDateString() === date?.toDateString()
  );

  return (
    <div className='flex space-x-4'>
      <Card className='flex-1'>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Manage your schedule and appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode='single'
            selected={date}
            onSelect={setDate}
            className='rounded-md border'
          />
        </CardContent>
      </Card>
      <Card className='flex-1'>
        <CardHeader>
          <CardTitle>Events for {date?.toDateString()}</CardTitle>
          <CardDescription>View and manage events for the selected date</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsForSelectedDate.length === 0 ? (
            <p>No events scheduled for this date.</p>
          ) : (
            <ul className='space-y-2'>
              {eventsForSelectedDate.map((event) => (
                <li key={event.id} className='border rounded p-2'>
                  <h3 className='font-semibold'>{event.title}</h3>
                  <p className='text-sm text-gray-500'>{event.type}</p>
                  <p className='text-sm'>{event.description}</p>
                </li>
              ))}
            </ul>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className='mt-4'>Add Event</Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>Create a new event for your calendar.</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='title' className='text-right'>
                    Title
                  </Label>
                  <Input
                    id='title'
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='date' className='text-right'>
                    Date
                  </Label>
                  <Input
                    id='date'
                    type='date'
                    value={newEvent.date.toISOString().split('T')[0]}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='type' className='text-right'>
                    Type
                  </Label>
                  <Select onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Select event type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Appointment'>Appointment</SelectItem>
                      <SelectItem value='Showing'>Showing</SelectItem>
                      <SelectItem value='Open House'>Open House</SelectItem>
                      <SelectItem value='Meeting'>Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='description' className='text-right'>
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className='col-span-3'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
