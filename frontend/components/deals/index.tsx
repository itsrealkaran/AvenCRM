'use client';

import { useCallback, useState } from 'react';
import { dealsApi } from '@/api/deals.service';
import { Deal, DealStatus, LeadStatus, UserRole } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

import { DataTable } from '../data-table';
import { adminColumns } from './admin-columns';
import { columns } from './columns';
import { CreateDealDialog } from './create-deal-dialog';
import { EditDealDialog } from './edit-deal-dialog';

async function getDeals() {
  try {
    return await dealsApi.getDeals();
  } catch (error) {
    throw new Error('Failed to fetch deals');
  }
}

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedRows, setSelectedRows] = useState<Deal[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

  const deals = response?.data || [];

  const deleteDeal = useMutation({
    mutationFn: async (dealId: string) => {
      try {
        await dealsApi.deleteDeal(dealId);
      } catch (error) {
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
      try {
        await dealsApi.bulkDeleteDeals(dealIds);
      } catch (error) {
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

  const handleStatusChange = async (recordId: string, newStatus: DealStatus | LeadStatus) => {
    try {
      // Check if the newStatus is of type DealStatus
      if (newStatus in DealStatus) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals/${recordId}/status`, {
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
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal status updated successfully');
    } catch (error) {
      toast.error('Failed to update deal status');
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      await deleteDeal.mutateAsync(dealId);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete deal');
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    const headers = ['Name', 'Amount', 'Status', 'Agent', 'Client', 'Created At'];
    const data = deals.map((deal) => [
      deal.name || '',
      deal.dealAmount?.toString() || '',
      deal.status || '',
      deal.agent?.name || '',
      new Date(deal.createdAt).toLocaleDateString() || '',
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
      link.setAttribute('download', `deals_${new Date().toISOString().split('T')[0]}.csv`);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Deals');

        // Generate filename
        const fileName = `deals_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download
        XLSX.writeFile(wb, fileName);

        toast.success('XLSX file downloaded successfully');
      } catch (error) {
        console.error('Error generating XLSX:', error);
        toast.error('Failed to generate XLSX file');
      }
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

  const handleSelectionChange = useCallback((deals: Deal[]) => {
    setSelectedRows(deals);
  }, []);

  return (
    <section className='flex-1 h-full'>
      <Card className='h-full w-full p-6'>
        <div className='flex justify-between items-center '>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Deals Management</h1>
            <p className='text-sm text-muted-foreground'>
              Manage and track your deals in one place
            </p>
          </div>
        </div>

        <div className='space-4 h-[calc(100%-50px)] flex-1'>
          <DataTable
            columns={user?.role === UserRole.ADMIN ? adminColumns : columns}
            data={deals}
            onEdit={handleEdit}
            onBulkDelete={async (row) => {
              const dealIds = row.map((row) => row.original.id);
              await handleBulkDelete(dealIds);
            }}
            onDelete={handleDelete}
            onSelectionChange={handleSelectionChange}
            onStatusChange={handleStatusChange}
            refetch={refetch}
            onDownload={handleDownload}
            onCreateDeal={() => setIsCreateDialogOpen(true)}
          />
        </div>

        <CreateDealDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          isLoading={isLoading}
        />
        <EditDealDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          deal={selectedDeal}
        />
      </Card>
    </section>
  );
}
