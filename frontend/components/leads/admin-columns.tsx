'use client';

import { Lead, LeadStatus } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowRightLeft,
  ArrowUpDown,
  CopyIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export const adminColumns: ColumnDef<Lead>[] = [
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
                    toast.promise(meta.onStatusChange(lead.id, statusOption), {
                      loading: 'Updating status...',
                      success: 'Status updated successfully',
                      error: 'Failed to update status',
                    });
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
    accessorKey: 'notes',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Notes
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
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
              {notes.map((note, index) => (
                <div key={index} className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-gray-600'>
                      {format(new Date(note.time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className='text-gray-700'>{note.note}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];