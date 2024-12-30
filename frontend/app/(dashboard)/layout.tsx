import React from 'react';

import AuthGuard from './auth-guard';
import { AuthProvider } from '@/contexts/AuthContext';
import { Providers } from '../providers';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>
    <AuthProvider>
    <Providers>
      {children}
      </Providers>
    </AuthProvider>
    </AuthGuard>;
}

export default DashboardLayout;
