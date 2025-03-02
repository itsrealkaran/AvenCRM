'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpDown,
  Calendar,
  CheckSquare,
  CheckSquareIcon,
  Mail,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';

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
import { api } from '@/lib/api';

interface NotificationSchema {
  id: string;
  title: string;
  message: string;
  type: 'calendar' | 'task' | 'lead' | 'upgrade';
  read: boolean;
  timestamp: string;
  link?: string;
}

const getIconByType = (type: NotificationSchema['type']) => {
  const iconProps = { className: 'w-4 h-4' };

  switch (type) {
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'lead':
      return <CheckSquareIcon {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'upgrade':
      return <Sparkles {...iconProps} />;
  }
};

const getIconColor = (type: NotificationSchema['type']) => {
  switch (type) {
    case 'calendar':
      return 'text-blue-500';
    case 'lead':
      return 'bg-red-500';
    case 'task':
      return 'text-green-500';
    case 'upgrade':
      return 'text-purple-500';
  }
};

export default function NotificationsPage() {
  const [sortKey, setSortKey] = useState<keyof NotificationSchema>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'email' | 'calendar' | 'task' | 'upgrade'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const router = useRouter();

  // Replace multiple state management with React Query
  const {
    data: activities,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notification');
      return response.data.notifications;
    },
  });

  const markAllAsRead = async () => {
    try {
      await api.put('/notification/mark-all-read');
      refetch(); // Refresh the data after marking as read
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const refreshActivities = () => {
    refetch();
  };

  const handleSort = (key: keyof NotificationSchema) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredActivities = activities
    ? activities.filter(
        (activity: NotificationSchema) =>
          (filter === 'all' || activity.type === filter) &&
          (readFilter === 'all' ||
            (readFilter === 'unread' && !activity.read) ||
            (readFilter === 'read' && activity.read)) &&
          (activity.title.toLowerCase().includes(filterValue.toLowerCase()) ||
            activity.message.toLowerCase().includes(filterValue.toLowerCase()))
      )
    : [];

  const filteredAndSortedActivities = [...filteredActivities].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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
            <Button variant='outline' onClick={refreshActivities}>
              <RefreshCw className={`h-4 w-4`} />
              Refresh
            </Button>
            <Select
              value={filter}
              onValueChange={(value: string) =>
                setFilter(value as 'all' | 'email' | 'calendar' | 'task' | 'upgrade')
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='email'>Email</SelectItem>
                <SelectItem value='calendar'>Calendar</SelectItem>
                <SelectItem value='task'>Task</SelectItem>
                <SelectItem value='upgrade'>Upgrade</SelectItem>
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
                  {filteredAndSortedActivities &&
                    filteredAndSortedActivities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className='hover:bg-gray-50'
                        onClick={() => router.push(activity.link)}
                      >
                        <TableCell>
                          <div className={`${getIconColor(activity.type)}`}>
                            {getIconByType(activity.type)}
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>{activity.title}</TableCell>
                        <TableCell className='hidden md:table-cell text-gray-500'>
                          {activity.message}
                        </TableCell>
                        <TableCell className='text-gray-500'>{activity.timestamp}</TableCell>
                        <TableCell className='text-right'>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.read
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-[#5932ea]/10 text-[#5932ea] border border-[#5932ea]/20'
                            }`}
                          >
                            {activity.read ? 'Read' : 'Unread'}
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
