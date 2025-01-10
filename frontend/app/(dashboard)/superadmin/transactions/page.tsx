'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import LoadingTableSkeleton from '@/components/loading-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { columns } from './columns';
import { DataTable } from './data-table';
import { EditTransactionDialog } from './edit-transaction-dialog';

async function getTransactions(): Promise<Transaction[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription`, {
    withCredentials: true,
  });
  if (!response) {
    throw new Error('Failed to fetch transactions');
  }
  return response.data;
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
    return <LoadingTableSkeleton />;
  }

  return (
    <section className='h-full'>
      <Card className='container mx-auto py-10 h-full'>
        <div className='flex justify-between items-center p-5'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-primary'>
              Transactions Management
            </h1>
            <p className='text-muted-foreground'>Manage and track your transactions in one place</p>
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

        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={selectedTransaction}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </section>
  );
}
