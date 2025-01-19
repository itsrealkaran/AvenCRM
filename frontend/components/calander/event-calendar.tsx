'use client';

import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { createEvent, deleteEvent, fetchEvents, updateEvent } from './api';
import EventModal from './event-modal';
import { getEventStyle } from './event-utils';
import EventCard from './event-card';

import { useToast } from '@/hooks/use-toast';
import { GoogleCalendarService } from '@/lib/google-calendar';

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
  }, [isGoogleConnected, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const filtered = events.filter(event =>
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

        if (eventData.id) {
          if (eventData.source === 'google') {
            updatedEvent = await googleCalendar.updateEvent(eventData.id, {
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

  const renderCalendar = () => {
    const startDay = currentDate.clone().startOf('month').startOf('week');
    const endDay = currentDate.clone().endOf('month').endOf('week');

    const calendar = [];
    let week = [];

    for (let day = startDay.clone(); day.isBefore(endDay); day = day.clone().add(1, 'd')) {
      const isCurrentMonth = day.month() === currentDate.month();
      const isToday = day.isSame(moment(), 'day');
      const isSelected = day.isSame(selectedDate, 'day');

      const dayEvents = filteredEvents.filter(event =>
        moment(event.start).isSame(day, 'day')
      );

      week.push(
        <button
          key={day.format('YYYY-MM-DD')}
          onClick={() => handleSelectDate(day)}
          className={`flex flex-col items-start justify-start p-1 sm:p-2 h-16 sm:h-24 w-full border border-gray-200 transition-all duration-200 ease-in-out ${
            isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
          } ${isToday ? 'font-bold bg-blue-100' : ''} ${
            isSelected ? 'bg-purple-100' : ''
          }`}
        >
          <span className={`text-xs sm:text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
            {day.format('D')}
          </span>
          <div className="flex flex-col w-full mt-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className="w-full text-xs truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80"
                style={{ backgroundColor: getEventStyle(event).backgroundColor, color: getEventStyle(event).textColor }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectEvent(event);
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700" onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement a modal to show all events for this day
                toast({
                  title: 'Coming soon',
                  description: 'View all events for this day',
                });
              }}>
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </button>
      );

      if (week.length === 7) {
        calendar.push(
          <div key={day.format('YYYY-MM-DD')} className="grid grid-cols-7 gap-px">
            {week}
          </div>
        );
        week = [];
      }
    }

    if (week.length > 0) {
      calendar.push(
        <div key={endDay.format('YYYY-MM-DD')} className="grid grid-cols-7 gap-px">
          {week}
        </div>
      );
    }

    return calendar;
  };

  const selectedDateEvents = filteredEvents.filter(event =>
    moment(event.start).isSame(selectedDate, 'day')
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 pb-0 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">Manage your events and schedules</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 text-xs sm:text-sm"
            onClick={handleConnectGoogle}
            disabled={loading || isGoogleConnected}
          >
            <img
              src="/google-calendar.svg"
              alt="Google Calendar"
              className="w-4 h-4 mr-2"
            />
            {isGoogleConnected ? 'Connected to Google' : 'Connect Google Calendar'}
          </Button>
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 text-xs sm:text-sm"
            onClick={() => toast({
              title: "Coming soon",
              description: "Outlook sync will be available soon!",
            })}
          >
            <img
              src="/outlook.svg"
              alt="Outlook"
              className="w-4 h-4 mr-2"
            />
            Sync with Outlook
          </Button>
          <Button
            onClick={handleSelectSlot}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 flex-1">
      <div className="h-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">{currentDate.format('MMMM YYYY')}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px mb-2">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <ScrollArea className="flex-grow">
              <div className="space-y-px">
                {renderCalendar()}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5" />
                <h2 className="font-medium">
                  {selectedDate.format('MMMM D, YYYY')}
                </h2>
              </div>
            </div>
            <div className="p-0">
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="p-4">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No events scheduled</p>
                      <p className="text-sm">Click the + button to add a new event</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
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

