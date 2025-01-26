'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/api/api';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

// import { AdminDashboard } from './components/admin-dashboard';
import { AgentDashboard } from './components/agent-dashboard';

// import { SuperAdminDashboard } from './components/superadmin-dashboard';

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
      <div className='flex-1 space-y-4 p-4 md:p-6 rounded-xl z-20 shadow-lg bg-white'>
        <div className='flex items-center justify-between space-y-2'>
          <div className='h-8 w-64 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='h-32 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-32 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-32 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-32 bg-gray-200 rounded animate-pulse'></div>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='h-96 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-96 bg-gray-200 rounded animate-pulse'></div>
          </div>
        </div>
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
      <AgentDashboard />
    </div>
  );
}
