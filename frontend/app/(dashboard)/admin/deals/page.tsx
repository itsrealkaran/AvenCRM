'use client';

import { useState } from 'react';
import { Deal, DealStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTableFilters } from '@/components/filters/data-table-filters';

import { columns } from './columns';
import { CreateDealDialog } from './create-deal-dialog';
import { DataTable } from './data-table';
import { EditDealDialog } from './edit-deal-dialog';

interface DealsResponse {
  data: Deal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DealFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  status?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function getDeals(filters: DealFilters = {}): Promise<DealsResponse> {
  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.createdById) queryParams.append('createdById', filters.createdById);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString());
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/deals?${queryParams.toString()}`,
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
    throw new Error(error || 'Failed to fetch deals');
  }
  return response.json();
}

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedRows, setSelectedRows] = useState<Deal[]>([]);
  const [filters, setFilters] = useState<DealFilters>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals', filters, page],
    queryFn: () => getDeals({ ...filters, page, limit: 10 }),
  });

  const deals = dealsData?.data || [];
  const totalPages = dealsData?.meta?.totalPages || 1;

  const statusOptions = Object.values(DealStatus).map(status => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const handleFilterChange = (newFilters: Partial<DealFilters>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const deleteDeal = useMutation({
    mutationFn: async (dealId: string) => {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals/${dealId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete deal');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete deal');
      setLoading(false);
    },
  });

  const bulkDeleteDeals = useMutation({
    mutationFn: async (dealIds: string[]) => {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ dealIds }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete deals');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deals deleted successfully');
      setSelectedRows([]);
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete deals');
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
        <h1 className='text-2xl font-semibold'>Deals</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Deal
        </Button>
      </div>

      <DataTableFilters
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        showAmountFilter
      />

      <Card>
        <DataTable
          columns={columns}
          data={deals}
          onEdit={(deal) => {
            setSelectedDeal(deal);
            setIsEditDialogOpen(true);
          }}
          onDelete={async (dealId) => {
            await deleteDeal.mutateAsync(dealId);
            setSelectedDeal(null);
          }}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onBulkDelete={(rows) => {
            bulkDeleteDeals.mutate(rows.map((row) => row.id));
          }}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      </Card>

      <CreateDealDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedDeal && (
        <EditDealDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          deal={selectedDeal}
          onDelete={async (dealId) => {
            await deleteDeal.mutateAsync(dealId);
            setSelectedDeal(null);
          }}
          onEdit={(deal) => {
            setSelectedDeal(deal);
          }}
        />
      )}
    </div>
  );
}
