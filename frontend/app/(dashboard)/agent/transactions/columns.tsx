'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Transaction, TransactionStatus } from '@/types';
import { ListItemIcon, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { type MRT_ColumnDef } from 'material-react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const columns: MRT_ColumnDef<Transaction>[] = [
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice Number',
    enableClickToCopy: true,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    Cell: ({ row }) => {
      const { currency } = useCurrency();
      const amount = parseFloat(row.getValue('amount'));
      const commissionRate = row.original.commissionRate || 0;
      const commissionAmount = (amount * commissionRate) / 100;

      const partner = row.original.partnerDetails;

      let finalAmount = commissionAmount;
      if (partner && partner.commissionRate) {
        const partnerCommission = commissionAmount * (partner.commissionRate / 100);
        finalAmount = finalAmount - partnerCommission;
      }
      return (
        <div className='flex flex-col gap-1'>
          <div>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(finalAmount)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant='outline'
          className={
            status === TransactionStatus.APPROVED
              ? 'bg-green-50 text-green-600'
              : status === TransactionStatus.REJECTED
                ? 'bg-red-50 text-red-600'
                : 'bg-yellow-50 text-yellow-600'
          }
        >
          {status === TransactionStatus.APPROVED
            ? 'Verified'
            : status === TransactionStatus.REJECTED
              ? 'Rejected'
              : 'Pending'}
        </Badge>
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
    accessorKey: 'partner',
    header: 'Partner',
    Cell: ({ row }: { row: { original: Transaction } }) => {
      const [open, setOpen] = useState(false);
      const partner = row.original.partnerDetails;

      if (!partner) {
        return 'N/A';
      }

      return (
        <>
          <Button
            variant='ghost'
            className='h-8 w-fit text-xs px-1 bg-gray-50 text-gray-800 hover:bg-gray-300'
            onClick={() => setOpen(true)}
          >
            <span className='sr-only'>View Partner Details</span>
            View Partner
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Partner Details</DialogTitle>
              </DialogHeader>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-sm font-medium'>Name</h4>
                  <p className='text-sm text-muted-foreground'>{partner.name}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium'>Phone</h4>
                  <p className='text-sm text-muted-foreground'>{partner.phone}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium'>Email</h4>
                  <p className='text-sm text-muted-foreground'>{partner.email}</p>
                </div>
                <div>
                  <h4 className='text-sm font-medium'>Commission Rate</h4>
                  <p className='text-sm text-muted-foreground'>{partner.commissionRate}%</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
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
}: {
  row: any;
  closeMenu: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
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
  <MenuItem
    key={1}
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
  <MenuItem
    key={2}
    onClick={() => {
      navigator.clipboard.writeText(row.original.id);
      closeMenu();
    }}
    sx={{ m: 0 }}
  >
    <ListItemIcon>
      <Copy className='size-4' />
    </ListItemIcon>
    Copy Transaction ID
  </MenuItem>,
];
