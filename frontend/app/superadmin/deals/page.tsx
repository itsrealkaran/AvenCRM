'use client';

import { useState } from 'react';
import { Deal } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateDealDialog } from './create-deal-dialog';
import { DataTable } from './data-table';
import { EditDealDialog } from './edit-deal-dialog';

async function getDeals(): Promise<Deal[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

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
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

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
    try {
      await deleteDeal.mutateAsync(dealId);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete deal');
    }
  };

  const handleBulkDelete = async (dealIds: string[]) => {
    try {
      await bulkDeleteDeals.mutateAsync(dealIds);
      toast.success('Deals deleted successfully');
    } catch (error) {
      toast.error('Failed to delete some deals');
    }
  };

  const handleSelectionChange = (deals: Deal[]) => {
    setSelectedRows(deals);
  };

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
                <Plus className='mr-2 h-4 w-4' /> Add New Deal
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
            <h1 className='text-3xl font-bold tracking-tight text-primary'>Deals Management</h1>
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
            onBulkDelete={async (row) => {
              const dealIds = row.map((row) => row.original.id);
              await handleBulkDelete(dealIds);
            }}
            onDelete={handleDelete}
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
      </Card>
    </section>
  );
}
