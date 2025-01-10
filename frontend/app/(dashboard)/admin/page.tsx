'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/services/api';
import { User } from '@/types';
import { Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AdminDashboard } from './components/admin-dashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch (error) {
        toast.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    );
  }

  if (!user) {
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
