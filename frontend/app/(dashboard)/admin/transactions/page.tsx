'use client';

import { useState } from 'react';
import { Transaction, TransactionType } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DataTableFilters } from '@/components/filters/data-table-filters';
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

async function getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.createdById) queryParams.append('createdById', filters.createdById);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString());
  if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions?${queryParams.toString()}`,
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
    throw new Error(error || 'Failed to fetch transactions');
  }
  return response.json();
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
    queryFn: () => getTransactions({ ...filters, page, limit: 10 }),
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
    mutationFn: async (transactionId: string) => {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/${transactionId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete transaction');
      setLoading(false);
    },
  });

  const bulkDeleteTransactions = useMutation({
    mutationFn: async (transactionIds: string[]) => {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ transactionIds }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete transactions');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions deleted successfully');
      setSelectedRows([]);
      setLoading(false);
    },
    onError: () => {
      toast.error('Failed to delete transactions');
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
        <h1 className='text-2xl font-semibold'>Transactions</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Transaction
        </Button>
      </div>

      <DataTableFilters
        onFilterChange={handleFilterChange}
        typeOptions={typeOptions}
        showAmountFilter
        showTypeFilter
      />

      <Card>
        <DataTable
          columns={columns}
          data={transactions}
          onEdit={(transaction) => {
            setSelectedTransaction(transaction);
            setIsEditDialogOpen(true);
          }}
          onDelete={(transaction) => {
            deleteTransaction.mutate(transaction.id);
          }}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          onBulkDelete={(rows) => {
            bulkDeleteTransactions.mutate(rows.map((row) => row.id));
          }}
          pageCount={totalPages}
          onPageChange={handlePageChange}
        />
      </Card>

      <CreateTransactionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {selectedTransaction && (
        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}
