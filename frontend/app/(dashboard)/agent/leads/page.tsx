'use client';

import { useState } from 'react';
import { Lead } from '@/types/leads';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateLeadDialog } from './create-lead-dialog';
import { DataTable } from './data-table';
import { EditLeadDialog } from './edit-lead-dialog';

async function getLeads(): Promise<Lead[]> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Access token not found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }
  return response.json();
}

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete lead');
    },
  });

  const bulkDeleteLeads = useMutation({
    mutationFn: async (leadIds: string[]) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete leads');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Leads deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete leads');
    },
  });

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate(leadId);
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${leadIds.length} leads?`)) {
      try {
        await bulkDeleteLeads.mutateAsync(leadIds);
        toast.success('Leads deleted successfully');
      } catch (error) {
        toast.error('Failed to delete some leads');
      }
    }
  };

  const handleSelectionChange = (leads: Lead[]) => {
    setSelectedRows(leads);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex justify-between items-center p-5'>
          <div className='space-y-3'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='space-y-4 p-6'>
          <div className='flex justify-between items-center'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-10 w-32' />
          </div>

          <div className='rounded-md border'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className='flex items-center justify-between p-4 border-b'>
                  <div className='flex items-center space-x-4'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-40' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-8 w-8' />
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2 mt-4'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center p-5'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Leads Management</h1>
          <p className='text-muted-foreground'>Manage and track your leads in one place</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Add New Lead
          </Button>
        </div>
      </div>

      <div className='space-4 p-6'>
        <DataTable
          columns={columns}
          data={leads}
          onEdit={handleEdit}
          onDelete={async (row) => {
            const leadIds = row.map((row) => row.original.id);
            await handleBulkDelete(leadIds);
          }}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <CreateLeadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <EditLeadDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lead={selectedLead}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
