'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/services/api';
import { User } from '@/types';
import { toast } from 'sonner';

import { SuperAdminDashboard } from './components/superadmin-dashboard';

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

  if (!user) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 rounded-xl z-20 shadow-lg bg-white'>
      <div className='flex justify-between'>
        <h1 className='text-3xl font-bold'>Welcome, {user.name}!</h1>
      </div>
      <SuperAdminDashboard user={user} />
    </div>
  );
}
