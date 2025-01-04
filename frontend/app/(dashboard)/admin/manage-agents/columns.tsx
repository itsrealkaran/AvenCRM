'use client';

import { User, UserRole } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, CopyIcon, MoreHorizontal, Pencil, Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getRoleBadgeColor = (role: UserRole) => {
  const colors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    TEAM_LEADER: 'bg-blue-100 text-blue-800',
    AGENT: 'bg-green-100 text-green-800',
    SUPERADMIN: 'bg-red-100 text-red-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const columns: ColumnDef<User>[] = [
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
    accessorKey: 'dob',
    header: 'Date of Birth',
    cell: ({ row }) => {
      return format(new Date(row.getValue('dob')), 'MM dd, yyyy');
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role: UserRole = row.getValue('role');
      return <Badge className={`${getRoleBadgeColor(role)}`}>{role.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: 'team',
    header: 'Team',
    cell: ({ row }) => {
      const team = row.original.team;
      return team ? team.name : 'Not Assigned';
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive: boolean = row.getValue('isActive');
      return (
        <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return format(new Date(row.getValue('createdAt')), 'MM dd, yyyy');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as {
        onEdit?: (user: User) => void;
        onDelete?: (userId: string) => void;
        onViewMetrics?: (userId: string) => void;
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
            <DropdownMenuItem onClick={() => meta.onEdit?.(user)}>
              <Pencil className='mr-2 h-4 w-4' /> Edit agent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onViewMetrics?.(user.id)}>
              <UserCog className='mr-2 h-4 w-4' /> View Metrics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onDelete?.(user.id)} className='text-red-600'>
              <Trash2 className='mr-2 h-4 w-4' /> Delete agent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(user.id);
                toast.success('Agent ID copied to clipboard');
              }}
            >
              <CopyIcon className='mr-2 h-4 w-4' /> Copy ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
