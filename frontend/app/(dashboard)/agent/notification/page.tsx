'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown, Calendar, CheckSquare, Mail, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Activity {
  id: number;
  title: string;
  subtitle: string;
  timestamp: string;
  type: 'calendar' | 'email' | 'task';
  isRead: boolean;
}

const initialActivities: Activity[] = [
  {
    id: 1,
    title: 'Client Meeting',
    subtitle: 'with Enterprise Team',
    timestamp: 'Today at 2:00 PM',
    type: 'calendar',
    isRead: false,
  },
  {
    id: 2,
    title: 'New Lead Response',
    subtitle: 'from contact@example.com',
    timestamp: 'Yesterday at 4:30 PM',
    type: 'email',
    isRead: true,
  },
  {
    id: 3,
    title: 'Update Property Listing',
    subtitle: 'Due in 2 hours',
    timestamp: 'Today at 5:00 PM',
    type: 'task',
    isRead: false,
  },
  {
    id: 4,
    title: 'Team Sync',
    subtitle: 'Weekly Progress Review',
    timestamp: 'Tomorrow at 10:00 AM',
    type: 'calendar',
    isRead: false,
  },
  {
    id: 5,
    title: 'Contract Review',
    subtitle: 'Pending approval',
    timestamp: 'Today at 3:00 PM',
    type: 'task',
    isRead: false,
  },
];

const getIconByType = (type: Activity['type']) => {
  const iconProps = { className: 'w-4 h-4' };

  switch (type) {
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
  }
};

const getIconColor = (type: Activity['type']) => {
  switch (type) {
    case 'calendar':
      return 'text-blue-500';
    case 'email':
      return 'text-[#5932ea]';
    case 'task':
      return 'text-green-500';
  }
};

export default function NotificationsPage() {
  const [sortKey, setSortKey] = useState<keyof Activity>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'email' | 'calendar' | 'task'>('all');
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'email' | 'calendar' | 'task');
  };

  const markAllAsRead = () => {
    setActivities(
      activities.map((activity) =>
        (readFilter === 'all' || (readFilter === 'unread' && !activity.isRead)) &&
        (filter === 'all' || activity.type === filter) &&
        (activity.title.toLowerCase().includes(filterValue.toLowerCase()) ||
          activity.subtitle.toLowerCase().includes(filterValue.toLowerCase()))
          ? { ...activity, isRead: true }
          : activity
      )
    );
  };

  const refreshActivities = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setActivities([...initialActivities]);
    setFilterValue('');
    setFilter('all');
    setReadFilter('all');
    setIsRefreshing(false);
    setIsLoading(false);
  };

  const handleSort = (key: keyof Activity) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedActivities = activities
    .filter(
      (activity) =>
        (filter === 'all' || activity.type === filter) &&
        (readFilter === 'all' ||
          (readFilter === 'unread' && !activity.isRead) ||
          (readFilter === 'read' && activity.isRead)) &&
        (activity.title.toLowerCase().includes(filterValue.toLowerCase()) ||
          activity.subtitle.toLowerCase().includes(filterValue.toLowerCase()))
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  useEffect(() => {
    setIsLoading(true);
    // Simulate initial data fetching
    setTimeout(() => {
      setActivities(initialActivities);
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex flex-col gap-6'>
        <div>
          <h1 className='text-2xl font-semibold mb-1'>Notifications</h1>
          <p className='text-gray-500'>Manage your notifications and activities</p>
        </div>

        <div className='space-y-4'>
          <Tabs
            value={readFilter}
            onValueChange={(value) => setReadFilter(value as 'all' | 'unread' | 'read')}
            className='w-full'
          >
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='unread'>Unread</TabsTrigger>
              <TabsTrigger value='read'>Read</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Filter notifications...'
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className='pl-8'
              />
            </div>
            <Button variant='outline' onClick={refreshActivities} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='email'>Email</SelectItem>
                <SelectItem value='calendar'>Calendar</SelectItem>
                <SelectItem value='task'>Task</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={markAllAsRead}>
              Mark visible as read
            </Button>
          </div>

          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50'>
                  <TableHead className='w-[100px]'>Type</TableHead>
                  <TableHead>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('title')}
                      className='font-medium -ml-4'
                    >
                      Title
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='hidden md:table-cell'>Details</TableHead>
                  <TableHead>
                    <Button
                      variant='ghost'
                      onClick={() => handleSort('timestamp')}
                      className='font-medium -ml-4'
                    >
                      Time
                      <ArrowUpDown className='ml-2 h-4 w-4' />
                    </Button>
                  </TableHead>
                  <TableHead className='text-right'>Status</TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className='h-4 w-4' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-[250px]' />
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <Skeleton className='h-4 w-[200px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-[100px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-[60px] ml-auto' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {filteredAndSortedActivities.map((activity) => (
                    <TableRow key={activity.id} className='hover:bg-gray-50'>
                      <TableCell>
                        <div className={`${getIconColor(activity.type)}`}>
                          {getIconByType(activity.type)}
                        </div>
                      </TableCell>
                      <TableCell className='font-medium'>{activity.title}</TableCell>
                      <TableCell className='hidden md:table-cell text-gray-500'>
                        {activity.subtitle}
                      </TableCell>
                      <TableCell className='text-gray-500'>{activity.timestamp}</TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activity.isRead
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-[#5932ea]/10 text-[#5932ea] border border-[#5932ea]/20'
                          }`}
                        >
                          {activity.isRead ? 'Read' : 'Unread'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
