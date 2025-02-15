'use client';

import { Transaction, TransactionStatus } from '@/types';
import { format } from 'date-fns';
import { Pencil, Trash2, UserCog } from 'lucide-react';
import { type MRT_ColumnDef } from 'material-react-table';
import { MenuItem, ListItemIcon } from '@mui/material';
import { Badge } from '@/components/ui/badge';

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
      const amount = parseFloat(row.getValue('amount'));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row }) => {
      const status: TransactionStatus = row.getValue('status');
      
      switch (status) {
        case TransactionStatus.APPROVED:
          return (
            <Badge variant='outline' className='bg-green-50 text-green-600'>
              Approved
            </Badge>
          );
        case TransactionStatus.REJECTED:
          return (
            <Badge variant='outline' className='bg-red-50 text-red-600'>
              Rejected
            </Badge>
          );
        default:
          return (
            <Badge variant='outline' className='bg-yellow-50 text-yellow-600'>
              Pending
            </Badge>
          );
      }
    },
    filterVariant: 'select',
    filterSelectOptions: Object.values(TransactionStatus),
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
  onVerify 
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
      <Pencil className="size-4" />
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
      className="text-green-600"
    >
      <ListItemIcon>
        <UserCog className="size-4 text-green-600" />
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
      className="text-orange-600"
    >
      <ListItemIcon>
        <UserCog className="size-4 text-orange-600" />
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
    className="text-red-600"
  >
    <ListItemIcon>
      <Trash2 className="size-4 text-red-600" />
    </ListItemIcon>
    Delete Transaction
  </MenuItem>,
];
