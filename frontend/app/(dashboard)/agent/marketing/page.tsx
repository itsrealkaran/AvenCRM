'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

function MarketingPage() {
  const router = useRouter();
  return (
    <div className='flex'>
      this is page builder page
      <Button onClick={() => router.push('/agent/marketing/add')}>Add</Button>
    </div>
  );
}

export default MarketingPage;
