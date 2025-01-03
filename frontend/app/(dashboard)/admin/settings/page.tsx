'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Bell, Camera, Lock, LogOut, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/services/users';

import { NotificationForm } from './components/notification-form';
import { PasswordForm } from './components/password-form';
import { ProfileForm } from './components/profile-form';

const Page = () => {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: uploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: usersApi.uploadAvatar,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Profile picture updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile picture');
    },
  });

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  if (!user) return null;

  return (
    <div className='min-h-screen h-full overflow-y-auto bg-gray-50/30'>
      {/* Header Section */}
      <div className='relative h-[200px] bg-gradient-to-r from-blue-600 to-blue-800'>
        <div className='absolute top-4 right-4'>
          <Button
            variant='secondary'
            className='flex items-center gap-2 hover:bg-white/90'
            onClick={handleSignOut}
          >
            <LogOut className='w-4 h-4' />
            Sign Out
          </Button>
        </div>
        <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2'>
          <div className='relative group'>
            <Avatar
              className='w-32 h-32 border-4 border-white shadow-lg cursor-pointer transition-transform hover:scale-105'
              onClick={handleAvatarClick}
            >
              <AvatarImage src={user.image || '/placeholder-avatar.jpg'} alt='Profile' />
              <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className='absolute bottom-0 right-0'>
              <Button
                size='icon'
                variant='secondary'
                className='rounded-full shadow-md'
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <Camera className='w-4 h-4' />
              </Button>
            </div>
            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='image/*'
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 pt-24 pb-12'>
        <Card className='max-w-4xl mx-auto'>
          <CardContent className='p-6'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>{user.name}</h1>
                <p className='text-muted-foreground'>{user.email}</p>
              </div>
              <Badge
                variant='secondary'
                className='text-sm px-3 py-1 capitalize bg-blue-100 text-blue-800'
              >
                {user.role.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>

            <Separator className='my-6' />

            <Tabs defaultValue='details' className='space-y-6'>
              <TabsList className='grid w-full grid-cols-3 gap-4 p-1'>
                <TabsTrigger
                  value='details'
                  className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                >
                  <UserCircle className='w-4 h-4' />
                  Personal Details
                </TabsTrigger>
                <TabsTrigger
                  value='password'
                  className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                >
                  <Lock className='w-4 h-4' />
                  Password & Security
                </TabsTrigger>
                <TabsTrigger
                  value='notification'
                  className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                >
                  <Bell className='w-4 h-4' />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value='details' className='space-y-6'>
                <ProfileForm />
              </TabsContent>

              <TabsContent value='password' className='space-y-6'>
                <PasswordForm />
              </TabsContent>

              <TabsContent value='notification' className='space-y-6'>
                <NotificationForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
