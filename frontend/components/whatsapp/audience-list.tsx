'use client';

import React, { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { CreateAudienceModal } from './create-audience-modal';

export interface AudienceGroup {
  id: string;
  name: string;
  phoneNumbers?: string[];
  _count?: {
    recipients: number;
  };
  createdAt: string;
  accountId?: string;
}

interface AudienceListProps {
  audiences: AudienceGroup[];
  onCreateAudience: (audience: AudienceGroup) => void;
}

export function AudienceList({ audiences: initialAudiences, onCreateAudience }: AudienceListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [audiences, setAudiences] = useState<AudienceGroup[]>(initialAudiences);
  const [editingAudience, setEditingAudience] = useState<AudienceGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use this effect only when initialAudiences changes from props
  useEffect(() => {
    setAudiences(initialAudiences);
  }, [initialAudiences]);

  const filteredAudiences = React.useMemo(() => {
    return audiences.filter((audience) =>
      audience.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [audiences, searchTerm]);

  const handleDeleteAudience = async (id: string) => {
    try {
      setIsLoading(true);
      await whatsAppService.deleteAudience(id);
      setAudiences((prev) => prev.filter((audience) => audience.id !== id));
      toast.success('Audience deleted successfully');
    } catch (error) {
      console.error('Error deleting audience:', error);
      toast.error('Failed to delete audience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAudience = async (audience: AudienceGroup) => {
    try {
      const audienceWithRecipients = await whatsAppService.getAudience(audience.id);
      setEditingAudience({
        ...audience,
        phoneNumbers: audienceWithRecipients.recipients.map((r: any) => r.phoneNumber),
      });
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error fetching audience details:', error);
      toast.error('Failed to load audience details');
    }
  };

  const handleCreateOrUpdateAudience = (audience: AudienceGroup) => {
    if (editingAudience) {
      setAudiences((prev) => prev.map((a) => (a.id === audience.id ? audience : a)));
    } else {
      setAudiences((prev) => [...prev, audience]);
      if (onCreateAudience) {
        onCreateAudience(audience);
      }
    }
    setEditingAudience(null);
    setShowCreateModal(false);
  };

  const columns: ColumnDef<AudienceGroup>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          className='flex items-center cursor-pointer'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      ),
      cell: ({ row }) => <div className='font-medium'>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'recipientCount',
      header: ({ column }) => (
        <div
          className='flex items-center cursor-pointer'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Recipients
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original._count?.recipients || 0;
        return (
          <Badge
            variant='outline'
            className='font-medium items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 hover:bg-green-100 transition-colors'
          >
            <span className='text-primary'>{count}</span>
            <span className='text-gray-600'>{count === 1 ? 'Recipient' : 'Recipients'}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div
          className='flex items-center cursor-pointer'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const audience = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => handleEditAudience(audience)}
                className='cursor-pointer'
              >
                <FaEdit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteAudience(audience.id)}
                className='cursor-pointer text-destructive'
              >
                <FaTrash className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredAudiences,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Groups</CardTitle>
        <CardDescription>Manage your WhatsApp audience groups</CardDescription>
        <div className='flex items-center justify-between mt-4'>
          <div className='relative w-64'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search audiences...'
              className='pl-8'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setEditingAudience(null);
              setShowCreateModal(true);
            }}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            Create Audience
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='text-center py-10'>Loading...</div>
        ) : audiences.length > 0 ? (
          <div className='rounded-md border'>
            <table className='w-full'>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className='h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground bg-gray-50/50'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='border-t hover:bg-gray-50/50'>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='p-4 align-middle text-sm'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className='h-24 text-center'>
                      No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-10'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4'>
              <FaUsers className='w-8 h-8 text-[#5932EA]' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No audience groups yet</h3>
            <p className='text-muted-foreground mb-4'>
              Create your first audience group to get started
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            >
              Create Audience
            </Button>
          </div>
        )}
      </CardContent>
      <CreateAudienceModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAudience(null);
        }}
        onCreateAudience={handleCreateOrUpdateAudience}
        editingAudience={editingAudience}
      />
    </Card>
  );
}
