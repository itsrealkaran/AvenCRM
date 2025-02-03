import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

import { Providers } from '../providers';

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
