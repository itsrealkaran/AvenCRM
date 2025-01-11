'use client'

import { Button } from '@/components/ui/button';
import  {useRouter}  from 'next/navigation';
import React from 'react';

function MarketingPage() {
  const router = useRouter();
  return(
    <div className='flex'>
      this is page builder page
      <Button onClick={() => router.push('/admin/marketing/add')}>Add</Button>
    </div>
  );
}

export default MarketingPage;
