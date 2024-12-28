'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  Camera,
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  Phone,
  User,
  UserCircle,
} from 'lucide-react';

import BackGroundImage from '@/components/BackGroundImage';
import SettingNotification from '@/components/SettingNotification';
import SettingPassword from '@/components/SettingPassword';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import SettingDetails from '../../superadmin/components/SettingDetails';
import { TopNavigation } from '../../superadmin/components/TopNavigation';

const Page = () => {
  const [activeTab, setActiveTab] = useState('details');
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/sign-in');
  };

  const tabs = [
    { id: 'details', label: 'Personal Details', icon: <UserCircle className='w-5 h-5' /> },
    { id: 'password', label: 'Password & Security', icon: <Lock className='w-5 h-5' /> },
    { id: 'notification', label: 'Notifications', icon: <Bell className='w-5 h-5' /> },
  ];

  return (
    <div className='h-full overflow-y-auto'>
      {/* Header Section */}
      <div className='relative h-[200px] bg-gradient-to-r from-blue-600 to-blue-800'>
        <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2'>
          <div className='relative group'>
            <Avatar className='w-32 h-32 border-4 border-white shadow-lg'>
              <AvatarImage src='/placeholder-avatar.jpg' alt='Profile' />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <div className='absolute bottom-0 right-0'>
              <Button size='icon' variant='secondary' className='rounded-full shadow-md'>
                <Camera className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 pt-24 pb-12'>
        <div className='gap-6'>
          {/* Left Sidebar */}
          {/* <Card className='col-span-3 h-fit'>
            <CardContent className='p-4'>
              <div className='space-y-2'>
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    className='w-full justify-start gap-3'
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                    <ChevronRight className='w-4 h-4 ml-auto' />
                  </Button>
                ))}
                <Separator className='my-4' />
                <Button
                  variant='destructive'
                  className='w-full justify-start gap-3'
                  onClick={handleSignOut}
                >
                  <LogOut className='w-5 h-5' />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Main Content Area */}
          <div className='col-span-9'>
            <Card>
              <CardContent className='p-6'>
                {activeTab === 'details' && (
                  <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-2xl font-semibold'>Personal Details</h2>
                      <Badge variant='secondary'>Agent</Badge>
                    </div>
                    <SettingDetails />
                  </div>
                )}
                {activeTab === 'password' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-semibold'>Password & Security</h2>
                    <SettingPassword />
                  </div>
                )}
                {activeTab === 'notification' && (
                  <div className='space-y-6'>
                    <h2 className='text-2xl font-semibold'>Notification Preferences</h2>
                    <SettingNotification />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
