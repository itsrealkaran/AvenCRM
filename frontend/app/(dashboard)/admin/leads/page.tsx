'use client';

import { useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { Lead, LeadFilters, LeadStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { LeadFilters as LeadFilterComponent } from '@/components/filters/lead-filters';
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
    queryFn: () => leadsApi.getLeads({ ...filters, page, limit: 10 }),
  });

  const leads = leadsData?.data || [];
  const totalPages = leadsData?.meta?.totalPages || 1;

  const statusOptions = Object.values(LeadStatus).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const deleteLead = useMutation({
    mutationFn: leadsApi.deleteLead,
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
    mutationFn: leadsApi.bulkDeleteLeads,
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
    <Card className='flex flex-col gap-4 p-7 max-h-[calc(100vh-150px)] overflow-y-auto'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Leads</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Lead
        </Button>
      </div>

      <LeadFilterComponent onFilterChange={handleFilterChange} statusOptions={statusOptions} />

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

      <CreateLeadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {selectedLead && (
        <EditLeadDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={selectedLead}
          onDelete={async (lead) => {
            await deleteLead.mutateAsync(lead.id);
            setSelectedLead(null);
          }}
          onEdit={(lead) => {
            setSelectedLead(lead);
          }}
        />
      )}
    </Card>
  );
}
