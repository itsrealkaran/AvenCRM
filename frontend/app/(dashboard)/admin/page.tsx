'use client';

import { authApi } from '@/services/api';
import { User } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { AdminDashboard } from './components/admin-dashboard';

export default function DashboardPage() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await authApi.me();
      return data as User;
    },
    retry: 2,
  });

  // Handle error with useEffect
  if (isError) {
    toast.error('Failed to fetch user data');
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-red-500'>Error loading user data. Please refresh the page.</p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 rounded-xl z-20 shadow-lg bg-white'>
      <div className='flex items-center justify-between space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Welcome back, {user.name}!</h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
