'use client';

import { useState } from 'react';
import { dealsApi } from '@/api/deals.service';
import { Deal, DealStatus } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ExternalLink, FileText } from 'lucide-react';
import { MRT_ColumnDef } from 'material-react-table';
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

import { AITextarea } from '../ui/ai-textarea';
import { useCurrency } from '@/contexts/CurrencyContext';

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
  author: string | null;
}

function NotesCell({ row }: any) {
  const notes = row.original.notes || [];
  const noteCount = Array.isArray(notes) ? notes.length : 0;
  const [showTextArea, setShowTextArea] = useState(false);
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: async ({ dealId, note }: { dealId: string; note: Note[] }) => {
      return dealsApi.addNote(dealId, note);
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
      dealId: row.original.id,
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
      <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col bg-white rounded-lg shadow-lg'>
        <div className=' bg-white border-b'>
          <DialogHeader className='p-2'>
            <DialogTitle className='text-2xl font-semibold text-gray-800'>
              Notes Timeline
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          <div className='space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-gray-200 before:via-gray-300 before:to-gray-200'>
            {Object.entries(notes as Record<string, Note>)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([time, note]) => (
                <div key={time} className='relative flex gap-6 items-start group animate-slide-up'>
                  <div className='absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-300 border border-blue-300 shadow-md'>
                    <div className='w-2.5 h-2.5 rounded-full bg-blue-600'></div>
                  </div>
                  <div className='flex-1 ml-4 space-y-2 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200'>
                    <div className='text-xs text-gray-500'>
                      {format(new Date(note.time), 'MMM d, yyyy HH:mm')}
                    </div>
                    <div className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                      <p>{note.note}</p>
                    </div>
                    {note.author && (
                      <div className='text-sm text-gray-500 absolute top-6 right-4'>
                        {note.author}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className='bg-white border-t p-2'>
          {showTextArea ? (
            <div className='space-y-4'>
              <AITextarea
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
            <div className='flex justify-end'>
              <Button onClick={() => setShowTextArea(true)} variant='outline'>
                Add New Note
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns: MRT_ColumnDef<Deal>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
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
    accessorKey: 'email',
    header: 'Email',
    enableClickToCopy: true,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row, table }) => {
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
    filterVariant: 'select',
    filterSelectOptions: Object.values(DealStatus),
  },
  {
    accessorKey: 'dealAmount',
    header: 'Amount',
    Cell: ({ row }) => {
      const { formatPrice } = useCurrency();
      const amount = formatPrice(row.getValue('dealAmount'));
      return amount ? `${amount}` : '-';
    },
  },
  {
    accessorKey: 'coOwners',
    header: 'Co-owners',
    Cell: ({ row }) => {
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
    Cell: ({ row }) => {
      return <NotesCell row={row} />;
    },
  },
  {
    accessorKey: 'documents',
    header: 'Documents',
    Cell: ({ row }: any) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const documents = row.getValue('documents') || [];

      return (
        <>
          <div
            className='cursor-pointer hover:text-primary transition-colors'
            onClick={() => setIsModalOpen(true)}
          >
            {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Deal Documents</DialogTitle>
              </DialogHeader>

              <div className='space-y-4'>
                {documents.length === 0 ? (
                  <p className='text-muted-foreground text-center py-4'>No documents available</p>
                ) : (
                  documents.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 rounded-lg border'
                    >
                      <div className='flex items-center gap-3'>
                        <FileText className='h-5 w-5 text-primary' />
                        <span className='font-medium'>{doc.name}</span>
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => window.open(doc.url, '_blank')}
                        className='hover:text-primary'
                      >
                        <ExternalLink className='h-4 w-4' />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    Cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy');
    },
  },
];
