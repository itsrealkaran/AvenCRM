import React from 'react';
import { Clock } from 'lucide-react';
import moment from 'moment';
import { getEventStyle } from './event-utils';

interface EventCardProps {
  event: any;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const { backgroundColor } = getEventStyle(event);
  const startTime = moment(event.start).format('h:mm A');
  const endTime = moment(event.end).format('h:mm A');

  return (
    <div
      className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer bg-white"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1 h-full rounded-full self-stretch"
          style={{ backgroundColor }}
        />
        <div className="flex-1 space-y-1">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{startTime} - {endTime}</span>
          </div>
          {event.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

