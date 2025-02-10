'use client';

import { SetStateAction, useCallback, useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { DealStatus, LeadResponse as Lead, LeadStatus, UserRole } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

import { DataTable } from '../data-table';
import { columns } from './columns';
import { ConvertToDealDialog } from './convert-to-deal-dialog';
import { CreateLeadDialog } from './create-lead-dialog';
import { EditLeadDialog } from './edit-lead-dialog';

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lead, setLead] = useState<any | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  async function getLeads() {
    try {
      const lead = await leadsApi.getLeads();
      //@ts-ignore
      setLead(lead.data);
      return lead;
    } catch (error) {
      throw new Error('Failed to fetch leads');
    }
  }

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

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

  const handleDownload = (format: 'csv' | 'xlsx') => {
    toast.success(`Downloading ${format.toUpperCase()} file...`);
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

  return (
    <section className='h-full'>
      <Card className='h-full w-full p-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold'>Leads Management</h1>
            <p className='text-sm text-muted-foreground'>
              Manage and track your leads in one place
            </p>
          </div>
        </div>

        <div className='space-4 h-[calc(100%-50px)] flex-1'>
          <DataTable
            columns={columns}
            data={lead || []}
            onEdit={handleEdit}
            onBulkDelete={async (row: any[]) => {
              const leadIds = row.map((row: { original: { id: any } }) => row.original.id);
              await handleBulkDelete(leadIds);
            }}
            onDelete={handleDelete}
            onSelectionChange={handleSelectionChange}
            onStatusChange={handleStatusChange}
            onConvertToDeal={(lead: SetStateAction<Lead | null>) => {
              setSelectedLead(lead);
              setIsConvertDialogOpen(true);
            }}
            refetch={refetch}
            onCreateLead={() => setIsCreateDialogOpen(true)}
            onDownload={handleDownload}
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
