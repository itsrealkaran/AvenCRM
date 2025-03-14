'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CirclePlus, Clock } from 'lucide-react';
import moment from 'moment';
import { PiMicrosoftOutlookLogoBold } from 'react-icons/pi';
import { SiGooglecalendar } from 'react-icons/si';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { MicrosoftCalendarService } from '@/lib/microsoft-calendar';
import { useToast } from '@/hooks/use-toast';

import { createEvent, deleteEvent, fetchEvents, updateEvent } from './api';
import EventCard from './event-card';
import EventModal from './event-modal';
import { getEventStyle } from './event-utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [searchTerm, setSearchTerm] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const googleCalendar = GoogleCalendarService.getInstance();
  const [isMicrosoftConnected, setIsMicrosoftConnected] = useState(false);
  const microsoftCalendar = MicrosoftCalendarService.getInstance();
  const { toast } = useToast();

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const localData = await fetchEvents();
      const formattedLocalEvents = localData.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        source: 'local',
      }));

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
      if (isMicrosoftConnected) {
        try {
          const microsoftEvents = await microsoftCalendar.listEvents();
          allEvents = [...allEvents, ...microsoftEvents];
        } catch (error) {
          console.error('Error loading Microsoft events:', error);
          toast({
            title: 'Warning',
            description: 'Failed to load Microsoft Calendar events',
            variant: 'destructive',
          });
        }
      }

      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isGoogleConnected, isMicrosoftConnected, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSelectDate = useCallback((date: moment.Moment) => {
    setSelectedDate(date);
  }, []);

  const handleSelectSlot = useCallback(() => {
    setSelectedEvent({ start: selectedDate.toDate(), end: selectedDate.toDate() });
    setIsModalOpen(true);
  }, [selectedDate]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleCreateOrUpdateEvent = useCallback(
    async (eventData: any) => {
      try {
        setLoading(true);
        let updatedEvent: any;
        console.log('eventData', eventData);
        if (eventData.id) {
          if (eventData.source === 'google') {
            updatedEvent = await googleCalendar.updateEvent(eventData.id, {
              title: eventData.title,
              description: eventData.description,
              start: eventData.start,
              end: eventData.end,
              location: eventData.location,
            });
          } else if (eventData.source === 'microsoft') {
            updatedEvent = await microsoftCalendar.updateEvent(eventData.id, {
              title: eventData.title,
              description: eventData.description,
              start: eventData.start,
              end: eventData.end,
              location: eventData.location,
            });
          } else {
            updatedEvent = await updateEvent(eventData.id, eventData);
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
                toast({
                  title: 'Warning',
                  description: 'Event updated locally but failed to sync with Google Calendar',
                  variant: 'destructive',
                });
              }
            }
          }
          toast({
            title: 'Success',
            description: 'Event updated successfully!',
            variant: 'success',
          });
        } else {
          updatedEvent = await createEvent(eventData);
          if (isGoogleConnected) {
            try {
              const googleEvent = await googleCalendar.createEvent({
                title: eventData.title,
                description: eventData.description,
                start: eventData.start,
                end: eventData.end,
                location: eventData.location,
              });
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
          toast({
            title: 'Success',
            description: 'Event created successfully!',
            variant: 'success',
          });
        }
        if (isMicrosoftConnected) {
          try {
            const microsoftEvent = await microsoftCalendar.createEvent({
              title: eventData.title,
              description: eventData.description,
              start: eventData.start,
              end: eventData.end,
              location: eventData.location,
            });
            updatedEvent = {
              ...updatedEvent,
              microsoftEventId: microsoftEvent.id,
            };
          } catch (error) {
            console.error('Failed to create event in Microsoft Calendar:', error);
            toast({
              title: 'Warning',
              description: 'Event created locally but failed to sync with Microsoft Calendar',
              variant: 'destructive',
            });
          }
        }

        await loadEvents();
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
          await googleCalendar.deleteEvent(eventId as string);
        } else {
          await deleteEvent(eventId as number);
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

  const handleConnectGoogle = async () => {
    try {
      await googleCalendar.initialize();
      await googleCalendar.signIn();
      setIsGoogleConnected(true);
      toast({
        title: 'Success',
        description: 'Connected to Google Calendar successfully!',
        variant: 'success',
      });
      if (isGoogleConnected) {
        loadEvents(); // Reload events to include Google Calendar events
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to Google Calendar',
        variant: 'destructive',
      });
    }
  };

  const renderCalendar = () => {
    const startDay = currentDate.clone().startOf('month').startOf('week');
    const endDay = currentDate.clone().endOf('month').endOf('week');

    const calendar = [];
    let week = [];

    for (let day = startDay.clone(); day.isBefore(endDay); day = day.clone().add(1, 'd')) {
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(moment(), 'day');
      const isSelected = day.isSame(selectedDate, 'day');

      const dayEvents = filteredEvents.filter((event) => moment(event.start).isSame(day, 'day'));

      week.push(
        <button
          key={day.format('YYYY-MM-DD')}
          onClick={() => handleSelectDate(day)}
          className={`flex flex-col items-start justify-start p-1 sm:p-2 h-16 sm:h-24 w-full border border-gray-200 transition-all duration-200 ease-in-out ${
            isToday
              ? 'font-bold bg-blue-100'
              : isSelected
                ? 'bg-purple-100'
                : isCurrentMonth
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-gray-50'
          }`}
        >
          <span
            className={`text-xs sm:text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {day.format('D')}
          </span>
          <div className='flex flex-col w-full mt-1 space-y-1 overflow-hidden'>
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className='w-full text-xs truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80'
                style={{
                  backgroundColor: getEventStyle(event).backgroundColor,
                  color: getEventStyle(event).textColor,
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className='text-xs text-gray-500 cursor-pointer hover:text-gray-700'>
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </button>
      );

      if (week.length === 7) {
        calendar.push(
          <div key={day.format('YYYY-MM-DD')} className='grid grid-cols-7 gap-px'>
            {week}
          </div>
        );
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push(
        <div key={endDay.format('YYYY-MM-DD')} className='grid grid-cols-7 gap-px'>
          {week}
        </div>
      );
    }

    return calendar;
  };

  const selectedDateEvents = filteredEvents.filter((event) =>
    moment(event.start).isSame(selectedDate, 'day')
  );

  return (
    <div className='flex flex-col h-full'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 pb-0 space-y-4 sm:space-y-0'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Calendar</h1>
          <p className='text-sm text-gray-500'>Manage your events and schedules</p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            variant='outline'
            className='bg-white hover:bg-gray-50 text-xs'
            onClick={handleConnectGoogle}
            disabled={loading || isGoogleConnected}
          >
            <SiGooglecalendar className='w-4 h-4' />
            {isGoogleConnected ? 'Connected to Google' : 'Connect Google Calendar'}
          </Button>
          <Button
            variant='outline'
            className='bg-white hover:bg-gray-50 text-xs'
            onClick={async () => {
              try {
                await microsoftCalendar.login();
                const isConnected = await microsoftCalendar.isConnected();
                setIsMicrosoftConnected(isConnected);
                if (isConnected) {
                  loadEvents();
                }
                toast({
                  title: 'Success',
                  description: 'Connected to Outlook Calendar successfully!',
                  variant: 'success',
                });
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'Failed to connect to Outlook Calendar',
                  variant: 'destructive',
                });
              }
            }}
            disabled={loading || isMicrosoftConnected}
          >
            <PiMicrosoftOutlookLogoBold className='w-4 h-4' />
            {isMicrosoftConnected ? 'Connected to Outlook' : 'Connect Outlook Calendar'}
          </Button>
          <Button
            onClick={handleSelectSlot}
            className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium text-xs'
          >
            <CirclePlus className='w-4 h-4' />
            Add New Event
          </Button>
        </div>
      </div>

      <div className='p-6 pt-0 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 flex-1'>
        <div className='h-full'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg sm:text-xl font-semibold'>
                {currentDate.format('MMMM YYYY')}
              </h2>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
            <div className='grid grid-cols-7 gap-px mb-2'>
              {WEEKDAYS.map((day) => (
                <div key={day} className='text-center text-xs sm:text-sm font-medium text-gray-500'>
                  {day}
                </div>
              ))}
            </div>
            <ScrollArea className='flex-grow'>
              <div className='space-y-px'>{renderCalendar()}</div>
            </ScrollArea>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='w-full'>
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <div className='flex items-center gap-2 text-gray-700'>
                <Calendar className='h-5 w-5' />
                <h2 className='font-medium'>{selectedDate.format('MMMM D, YYYY')}</h2>
              </div>
            </div>
            <div className='p-0'>
              <ScrollArea className='h-[calc(100vh-15rem)]'>
                <div className='p-4'>
                  {selectedDateEvents.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <Clock className='h-12 w-12 mx-auto mb-3 text-gray-400' />
                      <p className='font-medium'>No events scheduled</p>
                      <p className='text-sm'>Click the + button to add a new event</p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {selectedDateEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => handleSelectEvent(event)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        event={selectedEvent}
        onSave={handleCreateOrUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
