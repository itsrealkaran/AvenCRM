'use client';

import { useState } from 'react';
import { Deal } from '@/types/deals';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateDealDialog } from './create-deal-dialog';
import { DataTable } from './data-table';
import { EditDealDialog } from './edit-deal-dialog';

async function getDeals(): Promise<Deal[]> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Access token not found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch deals');
  }
  return response.json();
}

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedRows, setSelectedRows] = useState<Deal[]>([]);
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

  const deleteDeal = useMutation({
    mutationFn: async (dealId: string) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals/${dealId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete deal');
    },
  });

  const bulkDeleteDeals = useMutation({
    mutationFn: async (dealIds: string[]) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dealIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete deals');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deals deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete deals');
    },
  });

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (dealId: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      deleteDeal.mutate(dealId);
    }
  };

  const handleBulkDelete = async (dealIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${dealIds.length} deals?`)) {
      try {
        await bulkDeleteDeals.mutateAsync(dealIds);
        toast.success('Deals deleted successfully');
      } catch (error) {
        toast.error('Failed to delete some deals');
      }
    }
  };

  const handleSelectionChange = (deals: Deal[]) => {
    setSelectedRows(deals);
  };

  if (isLoading) {
    return (
      <div className='flex flex-col space-y-3'>
        <Skeleton className='w-[800px] h-[80px]' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[250px]' />
          <Skeleton className='h-4 w-[200px]' />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center p-5'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Deals Management</h1>
          <p className='text-muted-foreground'>Manage and track your deals in one place</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Add New Deal
          </Button>
        </div>
      </div>

      <div className='space-4 p-6'>
        <DataTable
          columns={columns}
          data={deals}
          onEdit={handleEdit}
          onDelete={async (row) => {
            const dealIds = row.map((row) => row.original.id);
            await handleBulkDelete(dealIds);
          }}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <CreateDealDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      <EditDealDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        deal={selectedDeal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
