'use client';

import React, { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { Box, ListItemIcon, MenuItem } from '@mui/material';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, RefreshCw, Search } from 'lucide-react';
import {
  MaterialReactTable,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { FaEdit, FaPause, FaPlay, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import type { AudienceGroup } from './audience-list';
import type { Campaign } from './create-campaign-modal';
import { CreateCampaignModal } from './create-campaign-modal';

interface CampaignsListProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  audiences: AudienceGroup[];
  onUpdateCampaign: (campaignId: string, data: Partial<Campaign>) => void;
}

export function CampaignsList({
  campaigns = [],
  onCreateCampaign,
  audiences,
  onUpdateCampaign,
}: CampaignsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleToggleCampaignStatus = async (campaign: Campaign) => {
    try {
      setIsLoading(true);
      const newStatus = campaign.status === 'Active' ? 'Paused' : 'Active';

      // Call the appropriate API method based on the status change
      if (newStatus === 'Active') {
        await whatsAppService.startCampaign(campaign.id!);
      } else {
        await whatsAppService.pauseCampaign(campaign.id!);
      }

      // Update the campaign in the local state
      onUpdateCampaign(campaign.id!, { status: newStatus });

      toast.success(`Campaign ${newStatus === 'Active' ? 'started' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
      toast.error(`Failed to ${campaign.status === 'Active' ? 'pause' : 'start'} campaign`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!campaign.id) return;

    try {
      setIsLoading(true);
      await whatsAppService.deleteCampaign(campaign.id);

      // Notify parent component to refresh campaigns
      onCreateCampaign();

      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      Cell: ({ row }: any) => {
        const value = row.original.type;
        const typeColors = {
          text: 'bg-blue-100 text-blue-800',
          image: 'bg-green-100 text-green-800',
          template: 'bg-purple-100 text-purple-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              typeColors[value as keyof typeof typeColors]
            }`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'audience.name',
      header: 'Audience',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ row }: any) => {
        const value = row.original.status;
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      Cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: campaigns,
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
      //density: 'compact',
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
        height: '540px',
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
            placeholder='Search campaigns...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            onClick={() => {
              setEditingCampaign(null);
              setShowCampaignModal(true);
            }}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            disabled={isLoading}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleEditCampaign(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <FaEdit className='size-4' />
        </ListItemIcon>
        Edit Campaign
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleToggleCampaignStatus(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          {row.original.status === 'Active' ? (
            <FaPause className='size-4' />
          ) : (
            <FaPlay className='size-4' />
          )}
        </ListItemIcon>
        {row.original.status === 'Active' ? 'Pause' : 'Resume'}
      </MenuItem>,
      <MenuItem
        key={2}
        onClick={() => {
          handleDeleteCampaign(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
        className='text-red-600'
      >
        <ListItemIcon>
          <FaTrash className='text-red-600 size-4' />
        </ListItemIcon>
        Delete Campaign
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
      <CreateCampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreateCampaign={(campaign) => {
          onUpdateCampaign(campaign.id!, campaign);
          setShowCampaignModal(false);
        }}
        editingCampaign={editingCampaign}
        audiences={audiences}
      />
    </Card>
  );
}
