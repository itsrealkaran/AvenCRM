'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { CreateLeadDialog } from './create-lead-dialog';

export function LeadsTableToolbar() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className='flex items-center justify-between mb-4'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input placeholder='Filter leads...' className='h-8 w-[150px] lg:w-[250px]' />
      </div>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className='mr-2 h-4 w-4' /> Add Lead
      </Button>
      <CreateLeadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
