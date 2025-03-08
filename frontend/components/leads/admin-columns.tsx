'use client';

import { useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { Lead, LeadStatus } from '@/types';
import { Box, lighten, ListItemIcon, MenuItem, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowRightLeft,
  ArrowUpDown,
  CopyIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { MRT_ColumnDef } from 'material-react-table';
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

import { AITextarea } from '../ui/ai-textarea';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface Note {
  note: string;
  time: string;
  author: string | null;
}

interface NotesCellProps {
  row: any; // We'll properly type this later
}

const updateLeadAgent = async (leadId: string, agentId: string | null) => {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/agent/${leadId}`,
    {
      agentId,
    },
    { withCredentials: true }
  );

  if (!response) {
    throw new Error('Failed to update agent');
  }

  return response.data;
};

function NotesCell({ row }: NotesCellProps) {
  const notes = row.original.notes || [];
  const noteCount = Array.isArray(notes) ? notes.length : 0;
  const [showTextArea, setShowTextArea] = useState(false);
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: Note[] }) => {
      return leadsApi.addNote(leadId, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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
      <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col bg-white rounded-lg shadow-lg'>
        <div className='bg-white border-b'>
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

export const adminColumns: MRT_ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'agentName',
    header: 'Created By',
    Cell: ({ row }) => {
      const agent = row.original.agent;
      return agent?.name || 'N/A';
    },
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    Cell: function Cell({ row }) {
      const queryClient = useQueryClient();
      const { data: agents } = useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
            withCredentials: true,
          });
          if (!response) {
            throw new Error('Failed to fetch agents');
          }
          return response.data;
        },
      });

      const mutation = useMutation({
        mutationFn: ({ leadId, agentId }: { leadId: string; agentId: string | null }) =>
          updateLeadAgent(leadId, agentId),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
          toast.success('Agent updated successfully');
        },
        onError: (error) => {
          toast.error('Failed to update agent');
          console.error('Error updating agent:', error);
        },
      });

      const handleAgentChange = (agentId: string) => {
        mutation.mutate({
          leadId: row.original.id,
          agentId: agentId === 'unassigned' ? null : agentId,
        });
      };

      return (
        <Select value={row.original.agentId || 'unassigned'} onValueChange={handleAgentChange}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Select an agent' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='unassigned'>Unassigned</SelectItem>
            {agents?.map((agent: any) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
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
    accessorKey: 'source',
    header: 'Source',
    Cell: ({ row }) => {
      const source = row.getValue('source') as string;
      return source ? source.charAt(0).toUpperCase() + source.slice(1).toLowerCase() : '';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row, table }) => {
      const status: LeadStatus = row.getValue('status');
      const lead = row.original as Lead;
      const meta = table.options.meta as {
        onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={status === 'WON'}>
            <Button variant='ghost' className='h-8 p-0'>
              <Badge className={`${getStatusColor(status)} cursor-pointer`}>{status}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[200px]'>
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.keys(LeadStatus).map((statusOption) => (
              <DropdownMenuItem
                key={statusOption}
                className={status === statusOption ? 'bg-accent' : ''}
                onClick={async () => {
                  if (status !== statusOption && meta.onStatusChange) {
                    await meta.onStatusChange(lead.id, statusOption as LeadStatus);
                  }
                }}
              >
                <Badge className={`${getStatusColor(statusOption as LeadStatus)} mr-2`}>
                  {statusOption}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    filterVariant: 'select',
    filterSelectOptions: Object.values(LeadStatus),
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    Cell: ({ row }) => {
      return <NotesCell row={row} />;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    Cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MMM d, yyyy');
    },
  }
];
