'use client';

import { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_time: string;
}

interface CampaignsListProps {
  onCreateCampaign: () => void;
  accessToken: string;
  adAccountId: string[] | null;
  campaigns: Campaign[];
}

export function CampaignsList({
  onCreateCampaign,
  accessToken,
  adAccountId,
  campaigns,
}: CampaignsListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const onEditCampaign = (campaign: Campaign) => {
    console.log(campaign, 'campaign from edit');
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
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Budget
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue('budget') as string;
        return (
          <span className='px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap'>
            {value ? `$${value}` : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'reach',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Reach
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
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
        const date = new Date(row.getValue('created_time'));
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEditCampaign?.(row.original)}>
              Edit Campaign
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteCampaign?.(row.original.id)}
              className='text-red-600'
            >
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: campaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <Card className='border rounded-lg'>
        <CardHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl'>Campaigns</CardTitle>
              <CardDescription>View and manage your Facebook ad campaigns</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Export Campaigns</DropdownMenuItem>
                <DropdownMenuItem>Import Campaigns</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='mt-4'>
            <Input placeholder='Filter campaigns...' className='max-w-sm' />
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {campaigns.length > 0 && (
            <div className='overflow-auto'>
              <table className='w-full min-w-[1000px]'>
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
                    <tr
                      key={row.id}
                      className='border-t hover:bg-gray-50/50 cursor-pointer'
                      onClick={() => {
                        setSelectedCampaign(row.original);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='p-4 align-middle text-sm'
                          onClick={(e) => {
                            // Prevent row click when clicking on actions
                            if (cell.column.id === 'actions') {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {campaigns.length === 0 && (
            <div className='text-center py-10'>
              <h3 className='text-lg font-semibold mb-2'>No campaigns yet</h3>
              <p className='text-muted-foreground mb-4'>
                Create your first campaign to get started
              </p>
              <Button onClick={onCreateCampaign} className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
                Create Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

                {/* Add more campaign details as needed */}

                <div className='col-span-2 pt-4 flex justify-end space-x-2'>
                  <Button variant='outline' onClick={() => onEditCampaign(selectedCampaign)}>
                    Edit Campaign
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
    </>
  );
}
