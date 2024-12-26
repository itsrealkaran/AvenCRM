'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { DataTable } from './data-table';
import { EditTransactionDialog } from './edit-transaction-dialog';

async function getTransactions(): Promise<Transaction[]> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Access token not found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
}

export default function TransactionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });

  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/${transactionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const bulkDeleteTransactions = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete transactions');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete transactions');
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction.mutate(transactionId);
    }
  };

  const handleBulkDelete = async (transactionIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${transactionIds.length} transactions?`)) {
      try {
        await bulkDeleteTransactions.mutateAsync(transactionIds);
        toast.success('Transactions deleted successfully');
      } catch (error) {
        toast.error('Failed to delete some transactions');
      }
    }
  };

  const handleSelectionChange = (transactions: Transaction[]) => {
    setSelectedRows(transactions);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-10'>
        {/* Header Skeleton */}
        <div className='flex justify-between items-center p-5'>
          <Skeleton className='h-9 w-64' /> {/* Title */}
          <Skeleton className='h-10 w-44' /> {/* Add Button */}
        </div>

        {/* Table Skeleton */}
        <div className='space-y-4 p-6 rounded-lg border'>
          {/* Table Header */}
          <div className='flex items-center justify-between pb-4'>
            <Skeleton className='h-8 w-[200px]' /> {/* Search bar */}
            <div className='flex space-x-2'>
              <Skeleton className='h-8 w-24' /> {/* Filter button */}
              <Skeleton className='h-8 w-24' /> {/* View button */}
            </div>
          </div>

          {/* Table Headers */}
          <div className='grid grid-cols-7 gap-4 border-b pb-4'>
            <Skeleton className='h-4 w-4' /> {/* Checkbox */}
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
          </div>

          {/* Table Rows */}
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className='grid grid-cols-7 gap-4 py-4 border-b'>
                <Skeleton className='h-4 w-4' /> {/* Checkbox */}
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-24' />
                <div className='flex space-x-2'>
                  <Skeleton className='h-8 w-8' /> {/* Edit button */}
                  <Skeleton className='h-8 w-8' /> {/* Delete button */}
                </div>
              </div>
            ))}

          {/* Table Footer */}
          <div className='flex items-center justify-between pt-4'>
            <Skeleton className='h-5 w-[200px]' /> {/* Rows per page */}
            <div className='flex space-x-2'>
              <Skeleton className='h-8 w-8' /> {/* Prev button */}
              <Skeleton className='h-8 w-24' /> {/* Page numbers */}
              <Skeleton className='h-8 w-8' /> {/* Next button */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className='p-4'>
      <Card>
        <div className='container mx-auto py-10'>
          <div className='flex justify-between items-center p-5'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Transactions Management</h1>
            </div>
            <div className='flex gap-2'>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' /> Add New Transaction
              </Button>
            </div>
          </div>

          <div className='space-4 p-6'>
            <DataTable
              columns={columns}
              data={transactions}
              onEdit={handleEdit}
              onDelete={async (row) => {
                const transactionIds = row.map((row) => row.original.id);
                await handleBulkDelete(transactionIds);
              }}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          <CreateTransactionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
          <EditTransactionDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            transaction={selectedTransaction}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </Card>
    </section>
  );
}
