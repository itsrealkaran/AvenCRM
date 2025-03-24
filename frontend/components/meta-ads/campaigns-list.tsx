'use client';

import React from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { Campaign } from '../whatsapp/create-campaign-modal';

interface CampaignsListProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  accessToken: string;
  adAccountId: string[] | null;
}

export function CampaignsList({
  campaigns,
  onCreateCampaign,
  accessToken,
  adAccountId,
}: CampaignsListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  console.log(accessToken);
  console.log(adAccountId, 'adAccountId from campaigns list');

  const getCampaigns = async () => {
    // @ts-ignore
    FB.api(
      `/act_${adAccountId}/campaigns?access_token=${accessToken}`,
      {
        effective_status: '["ACTIVE","PAUSED"]',
        fields: 'name,objective',
      },
      function (response: any) {
        if (response && !response.error) {
          console.log(response, 'response from get campaigns');
        }
      }
    );
  };
  getCampaigns();

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
              value === 'leads' ? 'bg-[#E8EFF7] text-[#2F6FED]' : 'bg-[#E8FFF3] text-[#1C9E75]'
            }`}
          >
            {value === 'leads' ? 'Lead Generation' : 'Traffic'}
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
              value === 'Active' ? 'bg-[#E8FFF3] text-[#1C9E75]' : 'bg-[#FFF9E7] text-[#E5B800]'
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
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      cell: () => (
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
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
        )}
        {campaigns.length === 0 && (
          <div className='text-center py-10'>
            <h3 className='text-lg font-semibold mb-2'>No campaigns yet</h3>
            <p className='text-muted-foreground mb-4'>Create your first campaign to get started</p>
            <Button onClick={onCreateCampaign} className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
              Create Campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
