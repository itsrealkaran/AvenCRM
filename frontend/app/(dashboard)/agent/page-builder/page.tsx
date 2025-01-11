'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

function PageBuilder() {
  const router = useRouter();
  return (
    <div className='flex'>
      this is page builder page
    </div>
  );
}

export default PageBuilder;
