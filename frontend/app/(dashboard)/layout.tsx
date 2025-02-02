import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

import { Providers } from '../providers';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <Providers>{children}</Providers>
      </AuthProvider>
    </CurrencyProvider>
  );
}

export default DashboardLayout;
