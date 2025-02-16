'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CalendarIcon, CheckSquareIcon, UserIcon } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'calendar' | 'task' | 'lead';
  read: boolean;
  timestamp: string;
  link?: string;
}

export function NotificationList({
  allNotifications,
  isLoading,
}: {
  allNotifications: Notification[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
  const { toast } = useToast();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/read/${notification.id}`,
          {},
          { withCredentials: true }
        );
        // Update the notification in the local state
        if (response.status === 200) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
          );
          if (notification.link) router.push(notification.link);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to mark notification as read',
          });
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIconByType = (type: 'calendar' | 'task' | 'lead') => {
    switch (type) {
      case 'calendar':
        return <CalendarIcon className='w-4 h-4 text-white' />;
      case 'task':
        return <CheckSquareIcon className='w-4 h-4 text-white' />;
      case 'lead':
        return <UserIcon className='w-4 h-4 text-white' />;
    }
  };

  const getIconBgColor = (type: 'calendar' | 'task' | 'lead') => {
    switch (type) {
      case 'calendar':
        return 'bg-blue-500';
      case 'task':
        return 'bg-green-500';
      case 'lead':
        return 'bg-red-500';
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/all`, {
        withCredentials: true,
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  if (isLoading) {
    return <div className='p-4 text-center'>Loading notifications...</div>;
  }

  if (allNotifications.length === 0) {
    return <div className='p-4 text-center text-muted-foreground'>No notifications</div>;
  }

  return (
    <div className='w-full'>
      <div className='px-4 py-3 border-b flex justify-between items-center'>
        <h3 className='font-semibold text-base'>Recent Activities</h3>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className='text-sm text-red-600 hover:text-red-800 transition-colors'
          >
            Clear All
          </button>
        )}
      </div>
      <div className='p-2 h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
        {allNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`flex items-start gap-3 my-2 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            <div
              className={`p-2 rounded-full ${getIconBgColor(notification.type)} flex items-center justify-center`}
              style={{ minWidth: '32px', height: '32px' }}
            >
              {getIconByType(notification.type)}
            </div>
            <div className='flex-1 min-w-0'>
              <p
                className={`text-sm font-medium ${!notification.read ? 'text-blue-600' : 'text-gray-900'}`}
              >
                {notification.title}
              </p>
              <p className='text-sm text-muted-foreground'>{notification.message}</p>
              <p className='text-xs text-muted-foreground mt-1'>{notification.timestamp}</p>
            </div>
            {!notification.read && <div className='w-2 h-2 bg-blue-500 rounded-full mt-1'></div>}
          </div>
        ))}
      </div>
      <div className='px-4 py-2 border-t'>
        <button
          onClick={() => router.push(`/${user?.role.toLowerCase()}/notification`)}
          className='w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2'
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
}
