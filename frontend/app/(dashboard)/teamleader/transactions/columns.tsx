'use client';

import { Transaction, TransactionStatus } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, Copy, MoreHorizontal, Pencil, Trash } from 'lucide-react';

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
    accessorKey: 'isVerfied',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Verified
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const isApproved = row.original.isApprovedByTeamLeader;
      const meta = table.options.meta as {
        onVerify?: (id: string, isVerified: TransactionStatus) => void;
      };

      if (isApproved === TransactionStatus.APPROVED) {
        return (
          <Badge variant='outline' className='bg-green-50 text-green-600 text-center'>
            Approved
          </Badge>
        );
      } else if (isApproved === TransactionStatus.REJECTED) {
        return (
          <Badge variant='outline' className='bg-red-50 text-red-600 text-center'>
            Rejected
          </Badge>
        );
      }

      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700'
            onClick={() => meta.onVerify?.(row.original.id, TransactionStatus.APPROVED)}
          >
            Approve
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700'
            onClick={() => meta.onVerify?.(row.original.id, TransactionStatus.REJECTED)}
          >
            Reject
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
              <Copy className='mr-2 h-4 w-4' /> Copy transaction ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
