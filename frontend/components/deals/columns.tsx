'use client';

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react';
import { Deal, DealStatus } from '@/types';
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

const colors: Record<DealStatus, string> = {
  CLOSED_LOST: 'bg-purple-100 text-purple-800',
  CLOSED_WON: 'bg-yellow-100 text-yellow-800',
  UNDER_CONTRACT: 'bg-indigo-100 text-indigo-800',
  PROSPECT: 'bg-orange-100 text-orange-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
};

const getStatusColor = (status: DealStatus): string => {
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
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phone
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const status: DealStatus = row.getValue('status');
      const deal = row.original as Deal;
      const meta = table.options.meta as {
        onStatusChange?: (dealId: string, newStatus: DealStatus) => Promise<void>;
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
            {Object.keys(DealStatus).map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                className={status === statusOption ? 'bg-accent' : ''}
                onClick={async () => {
                  if (status !== statusOption && meta.onStatusChange) {
                    await meta.onStatusChange(deal.id, statusOption as DealStatus);
                  }
                }}
              >
                <Badge className={`${getStatusColor(statusOption as DealStatus)} mr-2`}>
                  {statusOption}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: 'dealAmount',
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
      const amount = row.getValue('dealAmount');
      return amount ? `$${amount}` : '-';
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.original.notes || [];
      const noteCount = notes.length;

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
              {notes.map(
                (
                  note: {
                    time: string | number | Date;
                    note:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<AwaitedReactNode>
                      | null
                      | undefined;
                  },
                  index: Key | null | undefined
                ) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-500'>
                        {format(new Date(note.time), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className='text-gray-700'>{note.note}</p>
                  </div>
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
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