'use client';

import { Lead, LeadStatus } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
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
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: function AssignedToCell({ row }) {
      const queryClient = useQueryClient();
      const { data: agents } = useQuery({
        queryKey: ['team'],
        queryFn: async () => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team`, {
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
    accessorKey: 'source',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Source
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
                    <div className='flex-1 ml-4 space-y-2 bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200'>
                      <div className='text-xs text-gray-500'>
                        {format(new Date(time), 'MMM d, yyyy HH:mm')}
                      </div>
                      <div className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                        <p>{note.time}</p>
                        <p>{note.note}</p>
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
