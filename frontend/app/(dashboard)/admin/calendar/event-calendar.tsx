'use client'

import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { useEvents } from '@/hooks/use-event'
import EventModal from './event-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer for BigCalendar
const localizer = momentLocalizer(moment)

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { events, isLoading, error, mutate } = useEvents()

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent({ start, end })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error loading events. Please try again later.</div>
  }

  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Event Calendar</h1>
          <Button onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>
            Create Event
          </Button>
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
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
            mutate={mutate}
          />
        )}
      </CardContent>
    </Card>
  )
}

