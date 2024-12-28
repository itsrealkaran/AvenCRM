'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

function PageBuilder() {
  const router = useRouter();
  return (
    <div className='flex'>
      this is page builder page
      <Button onClick={() => router.push('/agent/page-builder/add')}>Add</Button>
    </div>
  );
}

export default PageBuilder;
