'use client';

import React, { useState } from 'react';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import EventModal from './event-modal';
import { mockEvents } from './mockData';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer for BigCalendar
const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({ start, end });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCreateOrUpdateEvent = (eventData) => {
    if (eventData.id) {
      setEvents(events.map((event) => (event.id === eventData.id ? eventData : event)));
    } else {
      const newEvent = { ...eventData, id: Date.now() };
      setEvents([...events, newEvent]);
    }
    closeModal();
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId));
    closeModal();
  };

  return (
    <Card className='w-full max-w-6xl mx-auto mt-8'>
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
