'use client';

import { useState } from 'react';
import { dealsApi } from '@/api/deals.service';
import { Deal, DealFilters, DealStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DealFilters as DealFilterComponent } from '@/components/filters/deal-filters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
    queryFn: () => dealsApi.getDeals({ ...filters, page, limit: 10 }),
  });

  const deals = dealsData?.data || [];
  const totalPages = dealsData?.meta?.totalPages || 1;

  const statusOptions = Object.values(DealStatus).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const handleFilterChange = (newFilters: Partial<DealFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const deleteDeal = useMutation({
    mutationFn: dealsApi.deleteDeal,
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
    mutationFn: dealsApi.bulkDeleteDeals,
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
    <Card className='flex flex-col gap-4 p-7 max-h-[calc(100vh-150px)] overflow-y-auto'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Deals</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Deal
        </Button>
      </div>

      <DealFilterComponent onFilterChange={handleFilterChange} statusOptions={statusOptions} />

      <DataTable
        columns={columns}
        data={deals}
        onEdit={(deal) => {
          setSelectedDeal(deal);
          setIsEditDialogOpen(true);
        }}
        onDelete={(dealId) => {
          deleteDeal.mutate(dealId);
        }}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onBulkDelete={(rows) => {
          bulkDeleteDeals.mutate(rows.map((row) => row.id));
        }}
        pageCount={totalPages}
        onPageChange={handlePageChange}
      />

      <CreateDealDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

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
    </Card>
  );
}
