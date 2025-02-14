'use client';

import { SetStateAction, useCallback, useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { DealStatus, LeadResponse as Lead, LeadStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { DataTable } from '@/components/data-table';
import { adminColumns } from '@/components/leads/admin-columns';
import { ConvertToDealDialog } from '@/components/leads/convert-to-deal-dialog';
import { CreateLeadDialog } from '@/components/leads/create-lead-dialog';
import { EditLeadDialog } from '@/components/leads/edit-lead-dialog';
import { Card } from '@/components/ui/card';

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lead, setLead] = useState<Lead[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const queryClient = useQueryClient();

  async function getLeads() {
    try {
      const lead = await leadsApi.getLeads();
      //@ts-ignore
      setLead(lead.data);
      console.log(lead);
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

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!lead || lead.length === 0) {
      toast.error('No data to download');
      return;
    }

    // Define common data structure
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Source',
      'Status',
      'Agent',
      'Created At'
    ];
    const data = lead.map((lead) => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.source || '',
      lead.status || '',
      lead.agent?.name || '',
      new Date(lead.createdAt).toLocaleDateString() || '',
    ]);

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...data.map((row) => row.map((field) => `"${field}"`).join(',')),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV file downloaded successfully');
    } else if (format === 'xlsx') {
      try {
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');

        // Generate filename
        const fileName = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download
        XLSX.writeFile(wb, fileName);

        toast.success('XLSX file downloaded successfully');
      } catch (error) {
        console.error('Error generating XLSX:', error);
        toast.error('Failed to generate XLSX file');
      }
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
            columns={adminColumns}
            data={lead || []}
            onEdit={handleEdit}
            onBulkDelete={async (row: any[]) => {
              const leadIds = row.map((row: { original: { id: any } }) => row.original.id);
              await handleBulkDelete(leadIds);
            }}
            onDelete={handleDelete}
            onSelectionChange={handleSelectionChange}
            onStatusChange={handleStatusChange}
            onDownload={handleDownload}
            onConvertToDeal={(lead: SetStateAction<Lead | null>) => {
              setSelectedLead(lead);
              setIsConvertDialogOpen(true);
            }}
            refetch={refetch}
            onCreateLead={() => setIsCreateDialogOpen(true)}
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
