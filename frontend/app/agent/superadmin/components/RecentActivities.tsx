'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'John Doe',
    action: 'Created a new company profile',
    timestamp: '2 minutes ago',
    type: 'success',
  },
  {
    id: '2',
    user: 'Alice Smith',
    action: 'Updated billing information',
    timestamp: '5 minutes ago',
    type: 'info',
  },
  {
    id: '3',
    user: 'Bob Johnson',
    action: 'Failed login attempt',
    timestamp: '10 minutes ago',
    type: 'error',
  },
  // Add more mock activities as needed
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[300px] pr-4'>
          <div className='space-y-4'>
            {mockActivities.map((activity) => (
              <div key={activity.id} className='flex items-start gap-4 rounded-lg border p-3'>
                <div
                  className={cn('mt-0.5 h-2 w-2 rounded-full', {
                    'bg-green-500': activity.type === 'success',
                    'bg-red-500': activity.type === 'error',
                    'bg-yellow-500': activity.type === 'warning',
                    'bg-blue-500': activity.type === 'info',
                  })}
                />
                <div className='flex-1 space-y-1'>
                  <p className='text-sm font-medium leading-none'>{activity.user}</p>
                  <p className='text-sm text-muted-foreground'>{activity.action}</p>
                  <p className='text-xs text-muted-foreground'>{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
