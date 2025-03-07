'use client';

import { useCallback, useMemo, useState } from 'react';
import { dealsApi } from '@/api/deals.service';
import { Deal, DealStatus, LeadStatus, UserRole } from '@/types';
import { Box, lighten, ListItemIcon, MenuItem, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CirclePlus,
  Copy,
  Download,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

import { adminColumns } from './admin-columns';
import { columns } from './columns';
import { CreateDealDialog } from './create-deal-dialog';
import { EditDealDialog } from './edit-deal-dialog';

async function getDeals() {
  try {
    return await dealsApi.getDeals();
  } catch (error) {
    throw new Error('Failed to fetch deals');
  }
}

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: response,
    isLoading: isDealsLoading,
    refetch,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: getDeals,
  });

  const deals = response?.data || [];

  const deleteDeal = useMutation({
    mutationFn: async (dealId: string) => {
      try {
        await dealsApi.deleteDeal(dealId);
      } catch (error) {
        throw new Error('Failed to delete deal');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete deal');
    },
  });

  const bulkDeleteDeals = useMutation({
    mutationFn: async (dealIds: string[]) => {
      try {
        await dealsApi.bulkDeleteDeals(dealIds);
      } catch (error) {
        throw new Error('Failed to delete deals');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deals deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete deals');
    },
  });

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = async (recordId: string, newStatus: DealStatus | LeadStatus) => {
    try {
      // Check if the newStatus is of type DealStatus
      if (newStatus in DealStatus) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deals/${recordId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include',
        });
      } else {
        // Handle DealStatus update here if necessary
      }
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal status updated successfully');
    } catch (error) {
      toast.error('Failed to update deal status');
    }
  };

  const handleDelete = async (dealId: string) => {
    try {
      await deleteDeal.mutateAsync(dealId);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete deal');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await refetch();
    setIsLoading(false);
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    const headers = ['Name', 'Amount', 'Status', 'Agent', 'Client', 'Created At'];
    const data = deals.map((deal) => [
      deal.name || '',
      deal.dealAmount?.toString() || '',
      deal.status || '',
      deal.agent?.name || '',
      new Date(deal.createdAt).toLocaleDateString() || '',
    ]);

    if (format === 'csv') {
      const csvRows = [
        headers.join(','),
        ...data.map((row) => row.map((field) => `"${field}"`).join(',')),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `deals_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV file downloaded successfully');
    } else if (format === 'xlsx') {
      try {
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Deals');

        // Generate filename
        const fileName = `deals_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download
        XLSX.writeFile(wb, fileName);

        toast.success('XLSX file downloaded successfully');
      } catch (error) {
        console.error('Error generating XLSX:', error);
        toast.error('Failed to generate XLSX file');
      }
    }
  };

  const handleBulkDelete = async (dealIds: string[]) => {
    try {
      await bulkDeleteDeals.mutateAsync(dealIds);
      toast.success('Deals deleted successfully');
    } catch (error) {
      toast.error('Failed to delete some deals');
    }
  };

  const tableColumns = useMemo(() => {
    return user?.role === UserRole.ADMIN ? adminColumns : columns;
  }, [user?.role]);

  const table = useMaterialReactTable({
    //@ts-ignore
    columns: tableColumns,
    data: deals,
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
        height: '600px',
        border: '1px solid rgb(201, 201, 201)',
        borderRadius: '8px',
      },
    },
    renderTopToolbar: ({ table }) => (
      <Box
        sx={(theme) => ({
          display: 'flex',
          gap: '0.5rem',
          py: '12px',
          justifyContent: 'space-between',
        })}
      >
        <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Input
            placeholder='Search deals...'
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='w-md'
          />
          <MRT_ToggleFiltersButton table={table} />
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          {table.getSelectedRowModel().rows.length > 0 && (
            <Button
              size={'sm'}
              variant={'outline'}
              className='font-normal text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white'
              onClick={async () => {
                const ok = confirm('Are you sure you want to delete these deals?');
                if (ok) {
                  handleBulkDelete(table.getSelectedRowModel().rows.map((row) => row.original.id));
                  table.resetRowSelection();
                }
              }}
            >
              <Trash2 className='size-4 mr-2' />
              Delete({table.getFilteredSelectedRowModel().rows.length})
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4' />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('xlsx')}>
                Export as XLSX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
          <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
            <CirclePlus className='h-4 w-4' /> Add New Deal
          </Button>
        </Box>
      </Box>
    ),
    state: {
      isLoading: isLoading || isDealsLoading,
    },
    meta: {
      onStatusChange: handleStatusChange,
    },
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          handleEdit(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <Pencil />
        </ListItemIcon>
        Edit Deal
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleDelete(row.original.id);
          closeMenu();
        }}
        sx={{ m: 0 }}
        className='text-red-600'
      >
        <ListItemIcon>
          <Trash2 className='text-red-600' />
        </ListItemIcon>
        Delete Deal
      </MenuItem>,
      <MenuItem
        key={2}
        onClick={() => {
          navigator.clipboard.writeText(row.original.id);
          toast.success('Deal ID copied to clipboard');
          closeMenu();
        }}
      >
        <ListItemIcon>
          <Copy className='size-4' />
        </ListItemIcon>
        Copy Deal ID
      </MenuItem>,
    ],
  });

  return (
    <section className='min-h-full w-full'>
      <Card className='min-h-full flex flex-1 flex-col p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Deals Management</h1>
            <p className='text-sm text-muted-foreground'>
              Manage and track your deals in one place
            </p>
          </div>
        </div>

        <MaterialReactTable table={table} />

        <CreateDealDialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) setSelectedDeal(null);
          }}
          isLoading={isLoading}
        />
        <EditDealDialog
          key={selectedDeal?.id}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setSelectedDeal(null);
          }}
          deal={selectedDeal}
        />
      </Card>
    </section>
  );
}
