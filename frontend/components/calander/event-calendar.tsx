'use client';

import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { createEvent, deleteEvent, fetchEvents, updateEvent } from './api';
import EventModal from './event-modal';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { toast } from 'react-hot-toast';

const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleCreateOrUpdateEvent = useCallback(
    async (eventData: any) => {
      try {
        setLoading(true);
        if (eventData.id) {
          await updateEvent(eventData.id, eventData);
          toast.success('Event updated successfully!');
        } else {
          const newEvent = await createEvent(eventData);
          setEvents((prevEvents) => [...prevEvents, newEvent]);
          toast.success('Event created successfully!');
        }
        await loadEvents();
      } catch (error) {
        toast.error('Failed to save event. Please try again.');
      } finally {
        setLoading(false);
        closeModal();
      }
    },
    [closeModal, loadEvents]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: number) => {
      try {
        setLoading(true);
        await deleteEvent(eventId);
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        toast.success('Event deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete event. Please try again.');
      } finally {
        setLoading(false);
        closeModal();
      }
    },
    [closeModal]
  );

  const eventStyleGetter = useCallback((event: any) => {
    const style = {
      backgroundColor: '#3182ce',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return { style };
  }, []);

  return (
    <Card className='w-full h-full max-w-6xl mx-auto mt-8 shadow-lg'>
      <CardContent className='p-6'>
        <div className='mb-6 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-800'>Event Calendar</h1>
          <Button
            onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}
            className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Create Event
          </Button>
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          className='rounded-lg shadow-sm'
        />
        <EventModal
          isOpen={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          onSave={handleCreateOrUpdateEvent}
          onDelete={handleDeleteEvent}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
