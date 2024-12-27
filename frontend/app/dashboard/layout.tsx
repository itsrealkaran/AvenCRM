import React from 'react';

import Sidebar from '@/components/layout/Sidebar';

import AuthGuard from './auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className='flex h-screen'>
        <Sidebar />
        <main className='flex-1 overflow-y-auto p-8'>{children}</main>
      </div>
    </AuthGuard>
  );
}
