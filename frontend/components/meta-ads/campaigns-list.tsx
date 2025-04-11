'use client';

import { useEffect, useState } from 'react';
import { Box, ListItemIcon, MenuItem } from '@mui/material';
import { MoreHorizontal } from 'lucide-react';
import {
  MaterialReactTable,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { FaEdit, FaPause, FaPlay, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
  budget?: string;
  reach?: string;
}

interface CampaignsListProps {
  onCreateCampaign: () => void;
  accessToken: string;
  adAccountId: string | null;
  campaigns: Campaign[];
}

export function CampaignsList({
  onCreateCampaign,
  accessToken,
  adAccountId,
  campaigns,
}: CampaignsListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onEditCampaign = (campaign: Campaign) => {
    //@ts-ignore
    FB.api(
      `/${campaign.id}?access_token=${accessToken}`,
      'POST',
      {
        status: campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
      },
      function (response: any) {
        console.log(response, 'response from edit campaign');
        toast({
          title: 'Campaign updated',
          description: 'Campaign updated successfully',
        });
      }
    );
  };

  const onDeleteCampaign = (campaignId: string) => {
    // @ts-ignore
    FB.api(`/${campaignId}?access_token=${accessToken}`, 'DELETE', function (response: any) {
      console.log(response, 'response from delete campaign');
      toast({
        title: 'Campaign deleted',
        description: 'Campaign deleted successfully',
      });
    });
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'objective',
      header: 'Type',
      Cell: ({ row }: any) => {
        const value = row.original.objective;
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              value === 'LEAD_GENERATION'
                ? 'bg-[#E8EFF7] text-[#2F6FED]'
                : 'bg-[#E8FFF3] text-[#1C9E75]'
            }`}
          >
            {value === 'LEAD_GENERATION' ? 'Lead Generation' : 'Traffic'}
          </span>
        );
      },
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      Cell: ({ row }: any) => {
        const value = row.original.budget;
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap'>
            {value ? `$${value}` : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'reach',
      header: 'Reach',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ row }: any) => {
        const value = row.original.status;
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              value === 'ACTIVE' ? 'bg-[#E8FFF3] text-[#1C9E75]' : 'bg-[#FFF9E7] text-[#E5B800]'
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_time',
      header: 'Created At',
      Cell: ({ row }: any) => {
        const date = new Date(row.original.created_time);
        return date.toLocaleDateString();
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
              onCreateCampaign();
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
          onEditCampaign(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <FaEdit className='size-4' />
        </ListItemIcon>
        {row.original.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          onDeleteCampaign(row.original.id);
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

      {/* Campaign Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>

          {selectedCampaign && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Campaign Name</h3>
                  <p className='mt-1 text-sm'>{selectedCampaign.name}</p>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Status</h3>
                  <span
                    className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedCampaign.status === 'ACTIVE'
                        ? 'bg-[#E8FFF3] text-[#1C9E75]'
                        : 'bg-[#FFF9E7] text-[#E5B800]'
                    }`}
                  >
                    {selectedCampaign.status}
                  </span>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Campaign ID</h3>
                  <p className='mt-1 text-sm font-mono'>{selectedCampaign.id}</p>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Objective</h3>
                  <p className='mt-1 text-sm'>
                    {selectedCampaign.objective === 'OUTCOME_LEADS' ? 'Lead Generation' : 'Traffic'}
                  </p>
                </div>

                <div className='col-span-2'>
                  <h3 className='text-sm font-medium text-gray-500'>Created At</h3>
                  <p className='mt-1 text-sm'>
                    {new Date(selectedCampaign.created_time).toLocaleString()}
                  </p>
                </div>

                <div className='col-span-2 pt-4 flex justify-end space-x-2'>
                  <Button
                    variant='outline'
                    className={`${
                      selectedCampaign.status !== 'ACTIVE'
                        ? 'bg-[#E8FFF3] hover:bg-[#E8FFF3]/90'
                        : 'bg-[#fef2cd] hover:bg-[#FFF9E7]/90'
                    } border-gray-100`}
                    onClick={() => onEditCampaign(selectedCampaign)}
                  >
                    {selectedCampaign.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => {
                      onDeleteCampaign(selectedCampaign.id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    Delete Campaign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
