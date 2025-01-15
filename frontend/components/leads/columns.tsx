'use client';

import { Lead, LeadStatus } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowRightLeft,
  ArrowUpDown,
  CopyIcon,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Checkbox } from '../ui/checkbox';

const getStatusColor = (status: LeadStatus) => {
  const colors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-purple-100 text-purple-800',
    QUALIFIED: 'bg-yellow-100 text-yellow-800',
    PROPOSAL: 'bg-indigo-100 text-indigo-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
    FOLLOWUP: 'bg-teal-100 text-teal-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const columns: ColumnDef<Lead>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row, table }) => {
      const status: LeadStatus = row.getValue('status');
      const lead = row.original as Lead;
      const meta = table.options.meta as {
        onEdit?: (lead: Lead) => void;
        onDelete?: (leadId: string) => void;
        onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 p-0'>
              <Badge className={`${getStatusColor(status)} cursor-pointer`}>{status}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[200px]'>
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(LeadStatus).map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                className={status === statusOption ? 'bg-accent' : ''}
                onClick={async () => {
                  if (status !== statusOption && meta.onStatusChange) {
                    await meta.onStatusChange(lead.id, statusOption);
                  }
                }}
              >
                <Badge className={`${getStatusColor(statusOption)} mr-2`}>{statusOption}</Badge>
                {/* {statusOption} */}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM d, yyyy');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const lead = row.original as Lead;
      const meta = table.options.meta as {
        onEdit?: (lead: Lead) => void;
        onDelete?: (leadId: string) => void;
        onConvertToDeal?: (lead: Lead) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[160px]'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.onEdit?.(lead)}>
              <Pencil className='mr-2 h-4 w-4' /> Edit lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onConvertToDeal?.(lead)}>
              <ArrowRightLeft className='mr-2 h-4 w-4' /> Convert to Deal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onDelete?.(lead.id)} className='text-red-600'>
              <Trash2 className='mr-2 h-4 w-4' /> Delete lead
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(lead.id);
                toast.success('Lead ID copied to clipboard');
              }}
            >
              <CopyIcon className='mr-2 h-4 w-4' /> Copy lead ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
