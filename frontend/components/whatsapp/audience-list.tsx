'use client';

import React, { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { Box, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';
import {
  MaterialReactTable,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  recipients?: {
    id: string;
    phoneNumber: string;
    name: string;
  }[];
  account?: {
    id: string;
    name: string;
    phoneNumberData: {
      id: string;
      phoneNumber: string;
      name: string;
      codeVerificationStatus: string;
    }[];
  };
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
  const [audiences, setAudiences] = useState<AudienceGroup[]>(initialAudiences);
  const [editingAudience, setEditingAudience] = useState<AudienceGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAudiences(initialAudiences);
  }, [initialAudiences]);

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

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      Cell: ({ row }: any) => <div className='font-medium'>{row.original.name}</div>,
    },
    {
      accessorKey: '_count.recipients',
      header: 'Recipients',
      Cell: ({ row }: any) => {
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
      header: 'Created',
      Cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: audiences,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    enableRowActions: true,
    enableColumnActions: false,
    positionActionsColumn: 'last',
    enableStickyHeader: true,
    initialState: {
      showGlobalFilter: true,
      columnPinning: {
        left: ['mrt-row-select'],
        right: ['mrt-row-actions'],
      },
    },
    muiTablePaperProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        boxShadow: 'none',
      },
    },
    muiTableContainerProps: {
      sx: {
        '--mui-palette-primary-main': '#7c3aed',
        '--mui-palette-primary-light': '#7c3aed',
        '--mui-palette-primary-dark': '#7c3aed',
        height: '340px',
        border: '1px solid rgb(201, 201, 201)',
        borderRadius: '8px',
      },
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '0.5rem',
          py: '12px',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Input
            placeholder='Search audiences...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            onClick={() => {
              setEditingAudience(null);
              setShowCreateModal(true);
            }}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            disabled={isLoading}
          >
            Create Audience
          </Button>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleEditAudience(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <FaEdit className='size-4' />
        </ListItemIcon>
        Edit Audience
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleDeleteAudience(row.original.id);
          closeMenu();
        }}
        sx={{ m: 0 }}
        className='text-red-600'
      >
        <ListItemIcon>
          <FaTrash className='text-red-600 size-4' />
        </ListItemIcon>
        Delete Audience
      </MenuItem>,
    ],
    state: {
      isLoading,
    },
  });

  return (
    <Card>
      <CardContent className='px-4 py-2'>
        <MaterialReactTable table={table} />
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
