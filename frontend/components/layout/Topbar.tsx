'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionMarkIcon } from '@radix-ui/react-icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Settings } from 'lucide-react';
import { CiBellOn } from 'react-icons/ci';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';

import { NotificationList } from '@/components/NotificationList';
import { SignOutButton } from '@/components/SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';

export default function Topbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const getInitials = (name: string) => {
    return name.split(' ')[0][0].toUpperCase();
  };

  const getNotifications = async () => {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/notification`, {
        withCredentials: true,
      });
      return data.notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const { data: notificationCount } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/count`,
        { withCredentials: true }
      );
      return data;
    },
    retry: 2,
  });

  return (
    <div className='w-full px-4 py-4 shadow-lg shadow-black/10 z-40 flex justify-between bg-white items-center'>
      <div className='relative w-[20%]'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input type='search' placeholder='Search dashboard...' className='pl-8 bg-background' />
      </div>

      <div className='flex items-center gap-4 cursor-pointer'>
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <div className='relative w-7 h-7 flex items-center justify-center text-[1.2rem] rounded-[8px] border-black/70 border-[1px] hover:bg-accent transition-colors'>
              <CiBellOn />
              {notificationCount > 0 ? (
                <span className='absolute -top-[4px] -right-[4px] w-3 h-3 bg-rose-500 rounded-full text-xs text-white flex justify-center items-center p-[7px]'>
                  {notificationCount}
                </span>
              ) : null}
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-0' align='end'>
            <NotificationList allNotifications={notifications || []} isLoading={isLoading} />
          </PopoverContent>
        </Popover>
        <div className='w-7 h-7 flex items-center opacity-50 justify-center text-[1.1rem] rounded-[8px] border-black/70 border-[1px]'>
          <QuestionMarkIcon />
        </div>

        <div className='flex items-center gap-[6px] mr-4'>
          <DropdownMenu onOpenChange={(open) => setIsDropdownActive(open)}>
            <DropdownMenuTrigger asChild>
              <div className='flex items-center gap-2 cursor-pointer'>
                <div className='w-[37px] h-[37px] rounded-full overflow-hidden ml-4 cursor-pointer'>
                  <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className='leading-[0.9rem] cursor-pointer'>
                  <h1 className='font-[600] text-[0.8rem] opacity-90 cursor-pointer'>
                    {user?.name}
                  </h1>
                  <p className='text-[0.65rem] opacity-70 cursor-pointer'>
                    {user?.role
                      ? user.role
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ')
                      : ''}
                  </p>
                </div>
                <div className='pr-2 cursor-pointer'>
                  {isDropdownActive ? <IoCaretUp color='#888' /> : <IoCaretDown color='#888' />}
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuItem
                onClick={() => {
                  const userRole =
                    user?.role === 'TEAM_LEADER' ? 'teamleader' : user?.role.toLowerCase();
                  router.push(`/${userRole}/settings`);
                }}
              >
                <Settings className='m-2 h-4 w-4' />
                Settings
              </DropdownMenuItem>
              <SignOutButton variant='ghost' className='w-full justify-start' />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
