'use client';

import { useState } from 'react';
import { transactionApi } from '@/api/api';
import { Transaction, TransactionType } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { TransactionFilters } from '@/components/filters/transaction-filters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { columns } from './columns';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { DataTable } from './data-table';
import { EditTransactionDialog } from './edit-transaction-dialog';

interface TransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function TransactionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', filters, page],
    queryFn: () => transactionApi.getAll({ ...filters, page, limit: 10 }).then((res) => res.data),
  });

  const transactions = transactionsData?.data || [];
  const totalPages = transactionsData?.meta?.totalPages || 1;

  const typeOptions = Object.values(TransactionType).map((type) => ({
    label: type.charAt(0) + type.slice(1).toLowerCase(),
    value: type,
  }));

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const deleteTransaction = useMutation({
    mutationFn: (transactionId: string) => {
      setLoading(true);
      return transactionApi.delete(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transaction');
      setLoading(false);
    },
  });

  const bulkDeleteTransactions = useMutation({
    mutationFn: (transactionIds: string[]) => {
      setLoading(true);
      return transactionApi.bulkDelete(transactionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions deleted successfully');
      setSelectedRows([]);
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transactions');
      setLoading(false);
    },
  });

  const verifyTransaction = useMutation({
    mutationFn: ({ transactionId, isVerified }: { transactionId: string; isVerified: boolean }) => {
      setLoading(true);
      return transactionApi.verify(transactionId, isVerified);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction status updated successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update transaction status');
      setLoading(false);
    },
  });

  if (isLoading) {
    return (
      <Card className='h-full p-6'>
        <Skeleton className='h-[400px] w-full' />
      </Card>
    );
  }

  return (
    <Card className='flex flex-col gap-4 p-6 h-full'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Transactions</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Transaction
        </Button>
      </div>

      <TransactionFilters onFilterChange={handleFilterChange} typeOptions={typeOptions} />

      <DataTable
        columns={columns}
        data={transactions}
        onEdit={(transaction) => {
          setSelectedTransaction(transaction);
          setIsEditDialogOpen(true);
        }}
        onDelete={async (transactionId) => {
          await deleteTransaction.mutateAsync(transactionId);
        }}
        onVerify={async (transactionId, isVerified) => {
          await verifyTransaction.mutateAsync({ transactionId, isVerified });
        }}
        onBulkDelete={async (rows: any[]) => {
          await bulkDeleteTransactions.mutateAsync(rows.map((row: { id: any }) => row.id));
        }}
      />

      <CreateTransactionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {selectedTransaction && (
        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={selectedTransaction}
        />
      )}
    </Card>
  );
}
