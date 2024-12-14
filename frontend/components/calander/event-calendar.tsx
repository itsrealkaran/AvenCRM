'use client';

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import EventModal from './event-modal';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createEvent, fetchEvents, updateEvent } from './api';

// Setup the localizer for BigCalendar
const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      // Convert string dates to Date objects
      const formattedEvents = data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCreateOrUpdateEvent = async (eventData: any) => {
    try {
      if (eventData.id) {
        await updateEvent(eventData.id, eventData);
      } else {
        const newEvent = await createEvent(eventData);
        setEvents([...events, newEvent]);
      }
      await loadEvents(); // Refresh events from server
    } catch (error) {
      console.error('Error handling event:', error);
    }
    closeModal();
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      setEvents(events.filter((event) => event.id !== eventId));
      await loadEvents(); // Refresh events from server after delete
    } catch (error) {
      console.error('Error deleting event:', error);
    }
    closeModal();
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <Card className='w-full h-full max-w-6xl mx-auto mt-8'>
      <CardContent className='p-6'>
        <div className='mb-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Event Calendar</h1>
          <Button onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>
            Create Event
          </Button>
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
        />
        {isModalOpen && (
          <EventModal
            isOpen={isModalOpen}
            onClose={closeModal}
            event={selectedEvent}
            onSave={handleCreateOrUpdateEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </CardContent>
    </Card>
  );
}
