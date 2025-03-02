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

import type { Campaign } from './create-campaign-modal';
import { CreateCampaignModal } from './create-campaign-modal';

interface AudienceGroup {
  id: string;
  name: string;
  phoneNumbers: string[];
  createdAt: string;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  audiences: AudienceGroup[];
  onUpdateCampaign: (campaign: Campaign) => void;
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
      const updatedCampaign = { ...campaign, status: newStatus }; // @ts-ignore
      onUpdateCampaign(updatedCampaign);

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

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      campaign.audience.name.toLowerCase().includes(filterValue.toLowerCase()) ||
      campaign.type.toLowerCase().includes(filterValue.toLowerCase())
  );

  const columns: ColumnDef<Campaign>[] = [
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
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const value = row.getValue('type') as string;
        const typeColors = {
          text: 'bg-blue-100 text-blue-800',
          image: 'bg-green-100 text-green-800',
          template: 'bg-purple-100 text-purple-800',
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${typeColors[value as keyof typeof typeColors]}`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'audience',
      header: 'Audience',
      cell: ({ row }) => {
        const audience = row.getValue('audience') as AudienceGroup;
        return audience.name;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as string;
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
        const date = new Date(row.getValue('createdAt'));
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0' disabled={isLoading}>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                <FaEdit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleCampaignStatus(campaign)}>
                {campaign.status === 'Active' ? (
                  <>
                    <FaPause className='mr-2 h-4 w-4' />
                    Pause
                  </>
                ) : (
                  <>
                    <FaPlay className='mr-2 h-4 w-4' />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteCampaign(campaign)}>
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
    data: filteredCampaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card className='border rounded-lg'>
      <CardHeader className='border-b'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-xl'>Campaigns</CardTitle>
            <CardDescription>View and manage your WhatsApp campaigns</CardDescription>
          </div>
        </div>
        <div className='mt-4 flex justify-between items-center'>
          <div className='relative max-w-sm'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Filter campaigns...'
              className='pl-8'
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
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
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {campaigns && campaigns.length > 0 ? (
          <div className='overflow-auto'>
            <table className='w-full min-w-[800px]'>
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className='border-t hover:bg-gray-50/50'>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className='p-4 align-middle text-sm'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-10'>
            <h3 className='text-lg font-semibold mb-2'>No campaigns yet</h3>
            <p className='text-muted-foreground mb-4'>
              Create your first WhatsApp campaign to get started
            </p>
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
          </div>
        )}
      </CardContent>
      <CreateCampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreateCampaign={(campaign) => {
          onUpdateCampaign(campaign);
          setShowCampaignModal(false);
        }} // @ts-ignore
        onCreateAudience={(audience: AudienceGroup): AudienceGroup => {
          // This is a placeholder. The actual audience creation is handled in the parent component.
          console.log('New audience created:', audience);
          return audience;
        }}
        editingCampaign={editingCampaign}
        audiences={audiences}
      />
    </Card>
  );
}
