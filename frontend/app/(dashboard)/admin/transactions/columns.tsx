'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { Transaction, TransactionStatus } from '@/types';
import { ListItemIcon, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import { Pencil, Trash2, UserCog } from 'lucide-react';
import { type MRT_ColumnDef } from 'material-react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const columns: MRT_ColumnDef<Transaction>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice Number',
    enableClickToCopy: true,
  },
  {
    accessorKey: 'agent.name',
    header: 'Created By',
    Cell: ({ row }) => {
      const agent = row.original.agent;
      return agent?.name || 'N/A';
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    Cell: ({ row }) => {
      const { currency } = useCurrency();
      const amount = parseFloat(row.getValue('amount'));
      const commissionRate = row.original.commissionRate || 0;
      const commissionAmount = (amount * commissionRate) / 100;

      return (
        <div className='flex flex-col gap-1'>
          <div>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(commissionAmount)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'isVerified',
    header: 'Status',
    Cell: ({ row, table }) => {
      const isVerified = row.original.status;
      const meta = table.options.meta as {
        onVerify?: (transactionId: string, isVerified: TransactionStatus) => void;
      };

      if (isVerified === TransactionStatus.APPROVED) {
        return (
          <Badge variant='outline' className='bg-green-50 text-green-600'>
            Verified
          </Badge>
        );
      } else if (isVerified === TransactionStatus.REJECTED) {
        return (
          <Badge variant='outline' className='bg-red-50 text-red-600'>
            Unverified
          </Badge>
        );
      }

      return (
        <div className='flex items-center gap-2'>
          <div className='flex gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => meta.onVerify?.(row.original.id, TransactionStatus.APPROVED)}
              className='h-7 px-2 text-xs bg-emerald-300 text-emerald-800 hover:bg-emerald-500 hover:text-white'
            >
              Verify
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => meta.onVerify?.(row.original.id, TransactionStatus.REJECTED)}
              className='h-7 px-2 text-xs bg-red-300 text-red-800 hover:bg-red-500 hover:text-white'
            >
              Unverify
            </Button>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'commissionRate',
    header: 'Commission Rate',
    Cell: ({ row }) => {
      return `${row.getValue('commissionRate')}%`;
    },
  },
  {
    accessorKey: 'transactionMethod',
    header: 'Transaction Method',
    Cell: ({ row }) => {
      const method = row.getValue('transactionMethod');
      if (!method) return 'N/A';
      return String(method)
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
  },
  {
    accessorKey: 'propertyType',
    header: 'Property Type',
    Cell: ({ row }) => {
      const type = row.getValue('propertyType');
      if (!type) return 'N/A';
      return String(type)
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    Cell: ({ row }) => {
      return format(new Date(row.getValue('date')), 'MMM d, yyyy');
    },
  },
];

export const renderRowActionMenuItems = ({
  row,
  closeMenu,
  onEdit,
  onDelete,
  onVerify,
}: {
  row: any;
  closeMenu: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onVerify: (transactionId: string, status: TransactionStatus) => void;
}) => [
  <MenuItem
    key={0}
    onClick={() => {
      onEdit(row.original);
      closeMenu();
    }}
    sx={{ m: 0 }}
  >
    <ListItemIcon>
      <Pencil className='size-4' />
    </ListItemIcon>
    Edit Transaction
  </MenuItem>,
  row.original.status === TransactionStatus.PENDING && (
    <MenuItem
      key={1}
      onClick={() => {
        onVerify(row.original.id, TransactionStatus.APPROVED);
        closeMenu();
      }}
      sx={{ m: 0 }}
      className='text-green-600'
    >
      <ListItemIcon>
        <UserCog className='size-4 text-green-600' />
      </ListItemIcon>
      Approve Transaction
    </MenuItem>
  ),
  row.original.status === TransactionStatus.PENDING && (
    <MenuItem
      key={2}
      onClick={() => {
        onVerify(row.original.id, TransactionStatus.REJECTED);
        closeMenu();
      }}
      sx={{ m: 0 }}
      className='text-orange-600'
    >
      <ListItemIcon>
        <UserCog className='size-4 text-orange-600' />
      </ListItemIcon>
      Reject Transaction
    </MenuItem>
  ),
  <MenuItem
    key={3}
    onClick={() => {
      onDelete(row.original.id);
      closeMenu();
    }}
    sx={{ m: 0 }}
    className='text-red-600'
  >
    <ListItemIcon>
      <Trash2 className='size-4 text-red-600' />
    </ListItemIcon>
    Delete Transaction
  </MenuItem>,
];
