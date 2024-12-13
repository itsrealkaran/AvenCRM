'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
  const [isStatusLoading, setIsStatusLoading] = useState(false);

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

  const updateTransactionStatus = useMutation({
    mutationFn: async ({
      transactionId,
      isVerified,
    }: {
      transactionId: string;
      isVerified: boolean;
    }) => {
      setIsStatusLoading(true);
      const loadingToast = toast.loading(
        `${isVerified ? 'Verifying' : 'Unverifying'} transaction...`
      );

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Access token not found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/verify/${transactionId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isVerified }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update transaction status');
        }

        toast.success(`Transaction ${isVerified ? 'verified' : 'unverified'} successfully`, {
          id: loadingToast,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
        toast.error(errorMessage, { id: loadingToast });
        throw error;
      } finally {
        setIsStatusLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
        <div className='flex justify-between items-center p-5'>
          <div className='space-y-3'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='space-y-4 p-6'>
          <div className='flex justify-between items-center'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-10 w-32' />
          </div>

          <div className='rounded-md border'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className='flex items-center justify-between p-4 border-b'>
                  <div className='flex items-center space-x-4'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-40' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-8 w-8' />
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2 mt-4'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>
      </div>
    );
  }

  return (
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
          onStatusChange={async (transactionId, isVerified) => {
            await updateTransactionStatus.mutateAsync({ transactionId, isVerified });
          }}
          disabled={deleteTransaction.isPending || bulkDeleteTransactions.isPending}
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
  );
}
