'use client';

import { SetStateAction, useCallback, useMemo, useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { DealStatus, LeadResponse as Lead, LeadStatus, UserRole } from '@/types';
import { Box, lighten, ListItemIcon, MenuItem, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CirclePlus,
  Copy,
  CopyIcon,
  Download,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  ArrowRightLeft,
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

import { columns } from './columns';
import { ConvertToDealDialog } from './convert-to-deal-dialog';
import { CreateLeadDialog } from './create-lead-dialog';
import { EditLeadDialog } from './edit-lead-dialog';

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lead, setLead] = useState<Lead[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  async function getLeads() {
    try {
      const lead = await leadsApi.getLeads();
      //@ts-ignore
      setLead(lead.data);
      return lead;
    } catch (error) {
      throw new Error('Failed to fetch leads');
    }
  }

  const {
    data: response,
    isLoading: isLeadsLoading,
    refetch,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const deleteLead = useMutation({
    mutationFn: async (leadId: string) => {
      try {
        await leadsApi.deleteLead(leadId);
      } catch (error) {
        throw new Error('Failed to delete lead');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete lead');
    },
  });

  const bulkDeleteLeads = useMutation({
    mutationFn: async (leadIds: string[]) => {
      try {
        await leadsApi.bulkDeleteLeads(leadIds);
      } catch (error) {
        throw new Error('Failed to delete leads');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Leads deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete leads');
    },
  });

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = async (recordId: string, newStatus: LeadStatus | DealStatus) => {
    try {
      // Check if the newStatus is of type LeadStatus
      if (newStatus in LeadStatus) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/${recordId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include',
        });
        if (!response.ok) {
          toast.error('Cannot change the status of a won lead');
        } else {
          await queryClient.invalidateQueries({ queryKey: ['leads'] });
          toast.success('Lead status updated successfully');
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead status updated successfully');
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleDelete = async (leadId: string) => {
    try {
      await deleteLead.mutateAsync(leadId);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to delete lead');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await refetch();
    setIsLoading(false);
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!lead || lead.length === 0) {
      toast.error('No data to download');
      return;
    }

    // Define common data structure
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Status', 'Agent', 'Created At'];
    const data = lead.map((lead) => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.source || '',
      lead.status || '',
      lead.agent?.name || '',
      new Date(lead.createdAt).toLocaleDateString() || '',
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
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Leads');

        // Generate filename
        const fileName = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download
        XLSX.writeFile(wb, fileName);

        toast.success('XLSX file downloaded successfully');
      } catch (error) {
        console.error('Error generating XLSX:', error);
        toast.error('Failed to generate XLSX file');
      }
    }
  };

  const handleBulkDelete = async (leadIds: string[]) => {
    try {
      await bulkDeleteLeads.mutateAsync(leadIds);
      toast.success('Leads deleted successfully');
    } catch (error) {
      toast.error('Failed to delete some leads');
    }
  };

  const handleSelectionChange = useCallback((leads: Lead[]) => {
    setSelectedRows(leads);
  }, []);

  const handleConvertToDeal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsConvertDialogOpen(true);
  };

  const table = useMaterialReactTable({
    //@ts-ignore
    columns,
    data: lead || [],
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
      density: 'compact',
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
            placeholder='Search leads...'
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
                const ok = confirm('Are you sure you want to delete these leads?');
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
            <CirclePlus className='h-4 w-4' /> Add New Lead
          </Button>
        </Box>
      </Box>
    ),
    state: {
      isLoading: isLoading || isLeadsLoading,
    },
    meta: {
      onStatusChange: handleStatusChange,
      onConvertToDeal: handleConvertToDeal,
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
          <Pencil className='size-4'/>
        </ListItemIcon>
        Edit Lead
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
          <Trash2 className='text-red-600 size-4' />
        </ListItemIcon>
        Delete Lead
      </MenuItem>,
      <MenuItem
        key={2}
        onClick={() => {
          handleConvertToDeal(row.original);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <ArrowRightLeft className='size-4'/>
        </ListItemIcon>
        Convert to Deal
      </MenuItem>,
      <MenuItem
        key={3}
        onClick={() => {
          navigator.clipboard.writeText(row.original.id);
          toast.success('Lead ID copied to clipboard');
          closeMenu();
        }}
      >
        <ListItemIcon>
          <CopyIcon className='size-4' />
        </ListItemIcon>
        Copy Lead ID
      </MenuItem>,
    ],
  });

  return (
    <section className='h-full'>
      <Card className='h-full w-full p-6'>
        <div className='flex justify-between items-center mb-2'>
          <div>
            <h1 className='text-2xl font-bold'>Leads Management</h1>
            <p className='text-sm text-muted-foreground'>
              Manage and track your leads in one place
            </p>
          </div>
        </div>

        <MaterialReactTable table={table} />

        <CreateLeadDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          isLoading={isLoading}
        />
        <EditLeadDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={selectedLead}
        />
        <ConvertToDealDialog
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          lead={selectedLead}
        />
      </Card>
    </section>
  );
}
