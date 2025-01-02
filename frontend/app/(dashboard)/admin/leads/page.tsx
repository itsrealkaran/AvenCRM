'use client';

import { useState } from 'react';
import { Lead, LeadStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableFilters } from '@/components/filters/data-table-filters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateLeadDialog } from './create-lead-dialog';
import { DataTable } from './data-table';
import { EditLeadDialog } from './edit-lead-dialog';

interface LeadsResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface LeadFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  status?: LeadStatus;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function getLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.createdById) queryParams.append('createdById', filters.createdById);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.source) queryParams.append('source', filters.source);
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/leads?${queryParams.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch leads');
  }
  return response.json();
}

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', filters, page],
    queryFn: () => getLeads({ ...filters, page, limit: 10 }),
  });

  const leads = leadsData?.data || [];
  const totalPages = leadsData?.meta?.totalPages || 1;

  const statusOptions = Object.values(LeadStatus).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/${leadId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete lead');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete lead');
      setLoading(false);
    },
  });

  const bulkDeleteLeads = useMutation({
    mutationFn: async (leadIds: string[]) => {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ leadIds }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete leads');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Leads deleted successfully');
      setSelectedRows([]);
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete leads');
      setLoading(false);
    },
  });

  if (isLoading) {
    return (
      <Card className='p-6'>
        <Skeleton className='h-[400px] w-full' />
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Leads</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Lead
        </Button>
      </div>

      <DataTableFilters
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        showSourceFilter
      />

      <Card>
        <DataTable
          columns={columns}
          data={leads}
          onEdit={(lead) => {
            setSelectedLead(lead);
            setIsEditDialogOpen(true);
          }}
          onDelete={(lead) => {
            deleteLead.mutate(lead.id);
          }}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onBulkDelete={(rows) => {
            bulkDeleteLeads.mutate(rows.map((row) => row.id));
          }}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      </Card>

      <CreateLeadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {selectedLead && (
        <EditLeadDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={selectedLead}
          onEdit={(lead) => {
            setSelectedLead(lead);
            setIsEditDialogOpen(true);
          }}
          onDelete={async (leadId) => {
            await deleteLead.mutateAsync(leadId);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}
