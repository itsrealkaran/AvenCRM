'use client';

import { useState } from 'react';
import { Lead } from '@/types/leads';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import LoadingTableSkeleton from '@/components/loading-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    return <LoadingTableSkeleton />;
  }

  return (
    <section className='flex-1 space-y-4 p-4 md:p-6'>
      <Card className='container mx-auto py-10'>
        <div className='flex justify-between items-center p-5'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-primary'>Leads Management</h1>
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
      </Card>
    </section>
  );
}
