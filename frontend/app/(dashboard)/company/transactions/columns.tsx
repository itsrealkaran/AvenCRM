'use client';

import { Transaction } from '@/types/transactions';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='px-1'>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='px-1'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Invoice Number
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'planType',
    header: 'Plan',
  },
  {
    accessorKey: 'isVerfied',
    header: 'Status',
    cell: ({ row, table }) => {
      const isVerified = row.getValue('isVerfied') as boolean;
      const meta = table.options.meta as {
        onStatusChange?: (transactionId: string, isVerified: boolean) => void;
        isStatusLoading?: boolean;
      };

      return (
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant={isVerified ? 'default' : 'outline'}
            onClick={() => meta.onStatusChange?.(row.original.id, true)}
            className='w-24 bg-green-600 text-white'
            disabled={isVerified || meta.isStatusLoading}
          >
            {meta.isStatusLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : isVerified ? (
              'Verified'
            ) : (
              'Verify'
            )}
          </Button>
          <Button
            size='sm'
            variant={!isVerified ? 'destructive' : 'outline'}
            onClick={() => meta.onStatusChange?.(row.original.id, false)}
            className='w-24 bg-red-600 text-white hover:bg-red-500 hover:text-white'
            disabled={!isVerified || meta.isStatusLoading}
          >
            {meta.isStatusLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : !isVerified ? (
              'Unverified'
            ) : (
              'Deny'
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return format(new Date(row.getValue('date')), 'MMM d, yyyy');
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const transaction = row.original;
      const meta = table.options.meta as {
        onEdit?: (transaction: Transaction) => void;
        onDelete?: (transactionId: string) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
              Copy transaction ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.onEdit?.(transaction)}>
              <Pencil className='mr-2 h-4 w-4' /> Edit transaction
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta.onDelete?.(transaction.id)}
              className='text-red-600'
            >
              <Trash className='mr-2 h-4 w-4' /> Delete transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
