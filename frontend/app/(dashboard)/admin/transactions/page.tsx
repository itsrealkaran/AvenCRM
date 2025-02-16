'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { transactionApi } from '@/api/api';
import { Transaction, TransactionStatus } from '@/types';
import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CirclePlus, RefreshCw, Upload } from 'lucide-react';
import {
  MaterialReactTable,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { columns, renderRowActionMenuItems } from './columns';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { EditTransactionDialog } from './edit-transaction-dialog';

export default function TransactionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll().then((res) => res.data),
  });

  const transactions = transactionsData?.data || [];

  const deleteTransaction = useMutation({
    mutationFn: (transactionId: string) => {
      setIsLoading(true);
      return transactionApi.delete(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transaction');
      setIsLoading(false);
    },
  });

  const bulkDeleteTransactions = useMutation({
    mutationFn: (transactionIds: string[]) => {
      setIsLoading(true);
      return transactionApi.bulkDelete(transactionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transactions deleted successfully');
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete transactions');
      setIsLoading(false);
    },
  });

  const verifyTransaction = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: TransactionStatus }) => {
      setIsLoading(true);
      try {
        await api.put(`/transactions/admin/verify/${id}`, { isVerified });
      } catch (error) {
        console.error('Error verifying transaction:', error);
        throw new Error('Failed to verify transaction');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction status updated successfully');
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update transaction status');
      setIsLoading(false);
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setIsLoading(false);
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    try {
      // Prepare data for export
      const exportData = transactions.map((transaction) => ({
        'Invoice Number': transaction.invoiceNumber,
        'Created By': transaction.agent?.name || 'N/A',
        Amount: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(transaction.amount),
        Status: transaction.status,
        Date: new Date(transaction.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        'Commission Rate': `${transaction.commissionRate || 0}%`,
        'Transaction Method': transaction.transactionMethod || 'N/A',
      }));

      if (format === 'csv') {
        // Create CSV content
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map((row) =>
            headers.map((header) => JSON.stringify(row[header as keyof typeof row])).join(',')
          ),
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Create XLSX workbook
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        // Generate and download XLSX file
        XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
      }

      toast.success(`Transactions exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error(`Failed to export transactions as ${format.toUpperCase()}`);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: transactions,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    enableRowActions: true,
    enableColumnActions: false,
    positionActionsColumn: 'last',
    enableStickyHeader: true,
    initialState: {
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    muiTablePaperProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        boxShadow: 'none',
      },
    },
    muiTableContainerProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        height: '600px',
        border: '1px solid rgb(201, 201, 201)',
        borderRadius: '8px',
      },
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
          py: '12px',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Input
            placeholder='Search transactions...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button
              variant='outline'
              size='sm'
              className='font-normal text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white'
              onClick={() => {
                if (window.confirm('Are you sure you want to delete these transactions?')) {
                  bulkDeleteTransactions.mutate(
                    table.getSelectedRowModel().rows.map((row) => row.original.id)
                  );
                  table.resetRowSelection();
                }
              }}
            >
              Delete ({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4' />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('xlsx')}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
            <CirclePlus className='h-4 w-4' /> Add Transaction
          </Button>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) =>
      renderRowActionMenuItems({
        row,
        closeMenu,
        onEdit: handleEdit,
        onDelete: (id) => deleteTransaction.mutate(id),
        onVerify: (id, isVerified) => verifyTransaction.mutate({ id, isVerified }),
      }),
    state: {
      isLoading: isLoading || isTransactionsLoading,
    },
    meta: {
      onVerify: (id: string, isVerified: TransactionStatus) =>
        verifyTransaction.mutate({ id, isVerified }),
    },
  });

  return (
    <div className='min-h-full w-full'>
      <Card className='min-h-full flex flex-1 flex-col p-6'>
        <div className='flex justify-between items-center mb-2'>
          <div>
            <h1 className='text-2xl font-bold'>Transactions</h1>
            <p className='text-sm text-muted-foreground'>
              Manage your transactions and their status
            </p>
          </div>
        </div>
        <MaterialReactTable table={table} />
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
