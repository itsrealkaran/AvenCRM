'use client';

import { useCallback, useState } from 'react';
import { leadsApi } from '@/services/leads.service';
import { DealStatus, LeadStatus } from '@estate/database';
import { LeadResponse as Lead } from '@estate/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { DataTable } from '../data-table';
import { columns } from './columns';
import { ConvertToDealDialog } from './convert-to-deal-dialog';
import { CreateLeadDialog } from './create-lead-dialog';
import { EditLeadDialog } from './edit-lead-dialog';

async function getLeads() {
  try {
    return await leadsApi.getLeads();
  } catch (error) {
    throw new Error('Failed to fetch leads');
  }
}

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const leads = response || [];

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      try {
        await leadsApi.deleteLead(leadId);
      } catch (error) {
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
      try {
        await leadsApi.bulkDeleteLeads(leadIds);
      } catch (error) {
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

  const handleStatusChange = async (recordId: string, newStatus: LeadStatus | DealStatus) => {
    try {
      // Check if the newStatus is of type LeadStatus
      if (newStatus in LeadStatus) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/${recordId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include',
        });
      } else {
        // Handle DealStatus update here if necessary
      }
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead status updated successfully');
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleDelete = async (leadId: string) => {
    try {
      await deleteLead.mutateAsync(leadId);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete lead');
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      await bulkDeleteLeads.mutateAsync(leadIds);
      toast.success('Leads deleted successfully');
    } catch (error) {
      toast.error('Failed to delete some leads');
    }
  };

  const handleSelectionChange = useCallback((leads: Lead[]) => {
    setSelectedRows(leads);
  }, []);

  if (isLoading) {
    return (
      <section className='flex-1 p-2 md:p-4'>
        <Card className='container mx-auto p-4 md:p-5'>
          <div className='flex justify-between items-center '>
            <div>
              <Skeleton className='h-10 w-60 mb-2' />
              <Skeleton className='h-6 w-96 bg-black/20' />
            </div>
            <div className='flex gap-2'>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' /> Add New Lead
              </Button>
            </div>
          </div>
          <div className='w-full items-center justify-center p-3'>
            <Skeleton className='w-[95%] h-[400px]' />
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className='flex-1 p-2 md:p-4 h-full'>
      <Card className='container mx-auto p-4 md:p-5'>
        <div className='flex justify-between items-center '>
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
            onBulkDelete={async (row) => {
              const leadIds = row.map((row) => row.original.id);
              await handleBulkDelete(leadIds);
            }}
            onDelete={handleDelete}
            onSelectionChange={handleSelectionChange}
            onStatusChange={handleStatusChange}
            onConvertToDeal={(lead) => {
              setSelectedLead(lead);
              setIsConvertDialogOpen(true);
            }}
          />
        </div>

        <CreateLeadDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          isLoading={isLoading}
        />
        <EditLeadDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={selectedLead}
        />
        <ConvertToDealDialog
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          lead={selectedLead}
        />
      </Card>
    </section>
  );
}
