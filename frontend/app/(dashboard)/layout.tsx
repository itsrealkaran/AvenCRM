import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Providers } from '../providers';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Providers>{children}</Providers>
    </AuthProvider>
  );
}

export default DashboardLayout;
