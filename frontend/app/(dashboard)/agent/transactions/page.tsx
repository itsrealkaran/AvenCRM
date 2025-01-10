'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import LoadingTableSkeleton from '@/components/loading-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

import { columns } from './columns';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { DataTable } from './data-table';
import { EditTransactionDialog } from './edit-transaction-dialog';

async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
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
      try {
        await api.delete(`/transactions/${transactionId}`);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
      setSelectedRows([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete transaction');
    },
  });

  const bulkDeleteTransactions = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      try {
        await api.delete('/transactions', {
          data: { transactionIds },
        });
      } catch (error) {
        console.error('Error bulk deleting transactions:', error);
        throw new Error('Failed to delete transactions');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions deleted successfully');
      setSelectedRows([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete transactions');
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

  return (
    <section className='flex-1 space-y-4 p-4 md:p-6'>
      <Card className='container mx-auto py-10'>
        <div className='flex justify-between items-center p-5'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-primary'>
              Transactions Management
            </h1>
            <p className='text-muted-foreground'>Manage and track your transactions in one place</p>
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
      </Card>
    </section>
  );
}
