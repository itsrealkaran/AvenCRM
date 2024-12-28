import React from 'react';

import AuthGuard from './auth-guard';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

export default DashboardLayout;
