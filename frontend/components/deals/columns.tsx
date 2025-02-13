'use client';

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
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
  DialogFooter,
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '@/api/deals.service';

const colors: Record<DealStatus, string> = {
  NEW: 'bg-purple-100 text-purple-800',
  DISCOVERY: 'bg-orange-100 text-orange-800',
  PROPOSAL: 'bg-emerald-100 text-emerald-800',
  UNDER_CONTRACT: 'bg-indigo-100 text-indigo-800',
  NEGOTIATION: 'bg-yellow-100 text-yellow-800',
  WON: 'bg-green-100 text-green-800',
};

const getStatusColor = (status: DealStatus): string => {
  return colors[status] || 'bg-gray-100 text-gray-800';
};

interface Note {
  note: string;
  time: string;
}

interface NotesCellProps {
  row: any; // We'll properly type this later
}

function NotesCell({ row }: NotesCellProps) {
  const notes = row.original.notes || [];
  const noteCount = Array.isArray(notes) ? notes.length : 0;
  const [showTextArea, setShowTextArea] = useState(false);
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: Note[] }) => {
      return dealsApi.addNote(leadId, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Note added successfully');
      setNewNote('');
      setShowTextArea(false);
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const existingNotes = Array.isArray(notes) ? notes : [];
    const newNoteObj = {
      note: newNote,
      time: new Date().toISOString(),
    };

    addNoteMutation.mutate({
      leadId: row.original.id,
      note: [...existingNotes, newNoteObj],
    });
  };

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
          {notes.map((note: Note, index: number) => (
            <div key={index} className='relative pl-6'>
              <div className='absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-300'></div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>
                    {format(new Date(note.time), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className='text-gray-700'>{note.note}</p>
              </div>
            </div>
          ))}
        </div>
        {showTextArea ? (
          <div className='mt-8 space-y-4'>
            <textarea
              placeholder='Add a new note...'
              className='w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none'
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowTextArea(false);
                  setNewNote('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        ) : (
          <div className='mt-8 flex justify-end'>
            <Button onClick={() => setShowTextArea(true)} variant='outline'>
              Add New Note
            </Button>
          </div>
        )}
      </DialogContent>
      <DialogFooter className='flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-x-4 sm:space-y-0 pt-4' />
    </Dialog>
  );
}

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
    accessorKey: 'coOwners',
    header: 'Co-owners',
    cell: ({ row }) => {
      const coOwners = row.original.coOwners || [];
      const coOwnerCount = coOwners.length;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-2 hover:bg-gray-100 transition duration-200'
            >
              <span className='font-medium text-gray-700'>{coOwnerCount}</span>
              {coOwnerCount === 1 ? 'Co-owner' : 'Co-owners'}
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto animate-fade-in bg-white rounded-lg shadow-lg p-6'>
            <DialogHeader>
              <DialogTitle>Co-owners</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              {coOwners.length > 0 ? (
                coOwners.map((coOwner: any, index: number) => (
                  <div
                    key={index}
                    className='flex flex-col gap-2 p-4 rounded-lg border border-gray-200'
                  >
                    <div className='grid grid-cols-3 gap-4'>
                      <div>
                        <span className='text-sm font-medium text-gray-500'>Name</span>
                        <p className='text-sm text-gray-900'>{coOwner.name || '-'}</p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-500'>Email</span>
                        <p className='text-sm text-gray-900'>{coOwner.email || '-'}</p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-gray-500'>Phone</span>
                        <p className='text-sm text-gray-900'>{coOwner.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-center text-gray-500'>No co-owners found</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      return <NotesCell row={row} />;
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
