import React from 'react';

import Calendar from '@/components/calander/event-calendar';

function CalendarPage() {
  return (
    <div className='w-full pb-12 overflow-y-auto'>
      <Calendar />
    </div>
  );
}

export default CalendarPage;
