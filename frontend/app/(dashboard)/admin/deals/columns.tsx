'use client';

import { Deal } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, CopyIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusTypes = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const;
type StatusType = (typeof statusTypes)[number];

const getStatusColor = (status: StatusType) => {
  const colors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-purple-100 text-purple-800',
    QUALIFIED: 'bg-yellow-100 text-yellow-800',
    PROPOSAL: 'bg-indigo-100 text-indigo-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
export const columns: ColumnDef<Deal>[] = [
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
    accessorKey: 'agent.name',
    header: 'Created By',
    cell: ({ row }) => {
      const agent = row.original.agent;
      return agent?.name || 'N/A';
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
    cell: ({ row }) => {
      const status: StatusType = row.getValue('status');
      return <Badge className={`${getStatusColor(status)}`}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'dealAmount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('dealAmount');
      return amount ? `$${amount}` : '-';
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.original.notes || {};
      const noteCount = Object.keys(notes).length;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-2 hover:bg-gray-100 transition duration-200'
            >
              <span className='font-medium text-gray-700'>{noteCount}</span>
              {noteCount === 1 ? 'Note' : 'Notes'}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto animate-fade-in bg-white rounded-lg shadow-lg p-6'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-semibold text-gray-800 mb-4'>
                Notes Timeline
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-gray-200 before:via-gray-300 before:to-gray-200'>
              {Object.entries(notes)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([time, note], index) => (
                  <div
                    key={time}
                    className='relative flex gap-6 items-start group animate-slide-up'
                  >
                    <div className='absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300 border border-blue-300 shadow-md'>
                      <div className='w-2.5 h-2.5 rounded-full bg-blue-600 group-hover:animate-pulse'></div>
                    </div>
                    <div className='flex-1 ml-4 space-y-2 bg-white rounded-lg p-4 shadow-sm border border-gray-200'>
                      <div className='text-xs text-gray-500'>
                        {format(new Date(time), 'MMM d, yyyy HH:mm')}
                      </div>
                      <div className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                        {note}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM d, yyyy');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const deal = row.original as Deal;
      const meta = table.options.meta as {
        onEdit?: (deal: Deal) => void;
        onDelete?: (dealId: string) => void;
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
            <DropdownMenuItem onClick={() => meta.onEdit?.(deal)}>
              <Pencil className='mr-2 h-4 w-4' /> Edit deal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onDelete?.(deal.id)} className='text-red-600'>
              <Trash2 className='mr-2 h-4 w-4' /> Delete deal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(deal.id);
                toast.success('Deal ID copied to clipboard');
              }}
            >
              <CopyIcon className='mr-2 h-4 w-4' /> Copy deal ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
