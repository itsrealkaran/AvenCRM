import React from 'react';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

import AuthGuard from './auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className='flex h-screen bg-slate-100'>
        <Sidebar />
        <div className='flex-1 flex flex-col'>
          <Topbar />
          <main className='flex-1 overflow-y-auto p-4'>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
