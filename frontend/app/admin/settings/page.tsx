'use client';

import React from 'react';
import { Bell, Camera, Lock, LogOut, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import SettingNotification from './components/SettingNotification';
import SettingPassword from './components/SettingPassword';
import SettingDetails from './components/SettingDetails';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

const Page = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await api.post('/api/auth/sign-out');
      logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className='min-h-screen h-full overflow-y-auto'>
      {/* Header Section */}
      <div className='relative h-[200px] bg-gradient-to-r from-blue-600 to-blue-800'>
        <div className='absolute top-4 right-4'>
          <Button 
            variant='secondary' 
            className='flex items-center gap-2'
            onClick={handleSignOut}
          >
            <LogOut className='w-4 h-4' />
            Sign Out
          </Button>
        </div>
        <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2'>
          <div className='relative group'>
            <Avatar className='w-32 h-32 border-4 border-white shadow-lg'>
              <AvatarImage src='/placeholder-avatar.jpg' alt='Profile' />
              <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                <div className='mb-6 flex items-center justify-between'>
                  <div>
                    <h1 className='text-2xl font-bold'>{user.name}</h1>
                    <p className='text-muted-foreground'>{user.email}</p>
                  </div>
                  <Badge variant='secondary' className='text-sm'>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>

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
                      <SettingDetails />
                    </div>
                  </TabsContent>

                  <TabsContent value='password'>
                    <div className='space-y-6'>
                      <SettingPassword />
                    </div>
                  </TabsContent>

                  <TabsContent value='notification'>
                    <div className='space-y-6'>
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
