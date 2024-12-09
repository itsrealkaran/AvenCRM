'use client';

import { useState } from 'react';
import { Lead } from '@/types/leads';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { columns } from './columns';
import { CreateLeadDialog } from './create-lead-dialog';
import { DataTable } from './data-table';

async function getLeads(): Promise<Lead[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }
  return response.json();
}

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Leads Management</h1>
          <p className='text-muted-foreground'>Manage and track your leads in one place</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Add New Lead
        </Button>
      </div>

      <div className='space-y-4'>
        <DataTable columns={columns} data={leads} />
      </div>

      <CreateLeadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
