'use client';

import React from 'react';
import { Bell, Camera, Lock, UserCircle } from 'lucide-react';

import SettingNotification from '@/components/SettingNotification';
import SettingPassword from '@/components/SettingPassword';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import SettingDetails from '../superadmin/components/SettingDetails';
import SettingsHeader from './components/SettingsHeader';

const Page = () => {
  return (
    <div className='min-h-screen h-full overflow-y-auto'>
      {/* Header Section */}
      <div className='relative h-[200px] bg-gradient-to-r from-blue-600 to-blue-800'>
        <SettingsHeader />
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
        <div className=''>
          {/* Main Content Area */}
          <div className='col-span-9'>
            <Card>
              <CardContent className='p-6'>
                <Tabs defaultValue='details' className='space-y-6'>
                  <TabsList className='grid grid-cols-3 gap-4'>
                    <TabsTrigger value='details' className='flex items-center gap-2'>
                      <UserCircle className='w-4 h-4' />
                      Personal Details
                    </TabsTrigger>
                    <TabsTrigger value='password' className='flex items-center gap-2'>
                      <Lock className='w-4 h-4' />
                      Password & Security
                    </TabsTrigger>
                    <TabsTrigger value='notification' className='flex items-center gap-2'>
                      <Bell className='w-4 h-4' />
                      Notifications
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='details'>
                    <div className='space-y-6'>
                      <div className='flex items-center justify-between'>
                        <h2 className='text-2xl font-semibold'>Personal Details</h2>
                        <Badge variant='secondary'>Agent</Badge>
                      </div>
                      <SettingDetails />
                    </div>
                  </TabsContent>

                  <TabsContent value='password'>
                    <div className='space-y-6'>
                      <h2 className='text-2xl font-semibold'>Password & Security</h2>
                      <SettingPassword />
                    </div>
                  </TabsContent>

                  <TabsContent value='notification'>
                    <div className='space-y-6'>
                      <h2 className='text-2xl font-semibold'>Notification Preferences</h2>
                      <SettingNotification />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
