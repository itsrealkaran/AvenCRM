import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DateTimePicker({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP HH:mm') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
        <div className='p-3 border-t'>
          <Input
            type='time'
            value={date ? format(date, 'HH:mm') : ''}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':');
              const newDate = date || new Date();
              newDate.setHours(parseInt(hours), parseInt(minutes));
              setDate(newDate);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
