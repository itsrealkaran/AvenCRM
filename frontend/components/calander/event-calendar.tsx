'use client';

import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { createEvent, deleteEvent, fetchEvents, updateEvent } from './api';
import EventModal from './event-modal';
import { getEventStyle } from './event-utils';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { GoogleCalendarService } from '@/lib/google-calendar';
import { useToast } from '@/hooks/use-toast';

const localizer = momentLocalizer(moment);

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const { toast } = useToast();

  const googleCalendar = GoogleCalendarService.getInstance();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Load local events
      const localData = await fetchEvents();
      const formattedLocalEvents = localData.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        source: 'local',
      }));

      // Load Google Calendar events if connected
      let allEvents = formattedLocalEvents;
      if (isGoogleConnected) {
        try {
          const googleEvents = await googleCalendar.listEvents();
          const formattedGoogleEvents = googleEvents.map((event) => ({
            ...event,
            source: 'google',
          }));
          allEvents = [...formattedLocalEvents, ...formattedGoogleEvents];
        } catch (error) {
          console.error('Error loading Google events:', error);
          toast({
            title: 'Warning',
            description: 'Failed to load Google Calendar events',
            variant: 'destructive',
          });
        }
      }

      setEvents(allEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isGoogleConnected]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      await googleCalendar.initialize();
      await googleCalendar.signIn();
      setIsGoogleConnected(true);
      toast({
        title: 'Success',
        description: 'Connected to Google Calendar successfully!',
        variant: 'success',
      });
      loadEvents(); // Reload events to include Google Calendar events
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
        let updatedEvent: any;

        if (eventData.id) {
          // Update existing event
          if (eventData.source === 'google') {
            // Update in Google Calendar
            updatedEvent = await googleCalendar.updateEvent(eventData.id, {
              title: eventData.title,
              description: eventData.description,
              start: eventData.start,
              end: eventData.end,
              location: eventData.location,
            });
          } else {
            // If connected to Google, also update there
            if (isGoogleConnected) {
              try {
                await googleCalendar.createEvent({
                  title: eventData.title,
                  description: eventData.description,
                  start: eventData.start,
                  end: eventData.end,
                  location: eventData.location,
                });
              } catch (error) {
                console.error('Failed to sync with Google Calendar:', error);
              }
            } else {
              // Update in local database
              updatedEvent = await updateEvent(eventData.id, eventData);
              toast({
                title: 'Warning',
                description: 'Event updated locally but failed to sync with Google Calendar',
                variant: 'destructive',
              });
            }
          }

          toast({
            title: 'Success',
            description: 'Event updated successfully!',
            variant: 'success',
          });
        } else {
          // Create new event
          // First create in local database
          updatedEvent = await createEvent(eventData);

          // If connected to Google, also create there
          if (isGoogleConnected) {
            try {
              const googleEvent = await googleCalendar.createEvent({
                title: eventData.title,
                description: eventData.description,
                start: eventData.start,
                end: eventData.end,
                location: eventData.location,
              });

              // Add the Google Calendar event ID to our local event
              updatedEvent = {
                ...updatedEvent,
                googleEventId: googleEvent.id,
              };
            } catch (error) {
              console.error('Failed to create event in Google Calendar:', error);
              toast({
                title: 'Warning',
                description: 'Event created locally but failed to sync with Google Calendar',
                variant: 'destructive',
              });
            }
          }

          setEvents((prevEvents) => [...prevEvents, updatedEvent]);
          toast({
            title: 'Success',
            description: 'Event created successfully!',
            variant: 'success',
          });
        }

        await loadEvents(); // Reload all events to ensure consistency
      } catch (error) {
        console.error('Error creating/updating event:', error);
        toast({
          title: 'Error',
          description: 'Failed to create/update event. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        closeModal();
      }
    },
    [closeModal, loadEvents, isGoogleConnected, googleCalendar, toast]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: string | number) => {
      try {
        setLoading(true);
        const eventToDelete = events.find((event) => event.id === eventId);

        if (eventToDelete?.source === 'google') {
          // Delete from Google Calendar
          await googleCalendar.deleteEvent(eventId as string);
        } else {
          // Delete from local database
          await deleteEvent(eventId as number);

          // If event has a Google Calendar ID, delete from there too
          if (isGoogleConnected && eventToDelete?.googleEventId) {
            try {
              await googleCalendar.deleteEvent(eventToDelete.googleEventId);
            } catch (error) {
              console.error('Failed to delete from Google Calendar:', error);
              toast({
                title: 'Warning',
                description: 'Event deleted locally but failed to remove from Google Calendar',
                variant: 'destructive',
              });
            }
          }
        }

        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        toast({
          title: 'Success',
          description: 'Event deleted successfully!',
          variant: 'success',
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete event. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        closeModal();
      }
    },
    [closeModal, events, isGoogleConnected, googleCalendar, toast]
  );

  const eventStyleGetter = useCallback((event: any) => {
    const { backgroundColor, textColor } = getEventStyle(event);
    const style = {
      backgroundColor,
      color: textColor,
      borderRadius: '5px',
      opacity: 0.8,
      border: '0px',
      display: 'block',
    };
    return { style };
  }, []);

  return (
    <Card className='w-full max-w-6xl mx-auto mt-8 shadow-lg'>
      <CardContent className='p-6'>
        <div className='mb-6 flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-800'>Event Calendar</h1>
          <div className='space-x-4'>
            <Button
              onClick={handleConnectGoogle}
              disabled={loading || isGoogleConnected}
              className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              {isGoogleConnected ? 'Connected to Google' : 'Connect Google Calendar'}
            </Button>
            <Button
              onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}
              className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Create Event
            </Button>
          </div>
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
        />
      </CardContent>
    </Card>
  );
}
