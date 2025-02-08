'use client';

import { CurrencyProvider } from '@/contexts/CurrencyContext';

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
}
