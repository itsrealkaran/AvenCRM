'use client';

import { SetStateAction, useCallback, useMemo, useRef, useState } from 'react';
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
import { read, utils } from 'xlsx';

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
import { ConvertToDealDialog } from '@/components/leads/convert-to-deal-dialog';
import { CreateLeadDialog } from '@/components/leads/create-lead-dialog';
import { EditLeadDialog } from '@/components/leads/edit-lead-dialog';
import FileImportModal from '@/components/data-table/file-import-modal';

export default function LeadsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lead, setLead] = useState<Lead[] | null>(null);
  const [selectedRows, setSelectedRows] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<Record<string, string>[] | null>(null);
  const [headers, setHeaders] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const leads = response?.data || [];

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

  const handleConvertToDeal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsConvertDialogOpen(true);
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

  const handleBulkDelete = async () => {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
    if (selectedIds.length === 0) {
      toast.error('No leads selected');
      return;
    }

    try {
      await bulkDeleteLeads.mutateAsync(selectedIds);
      table.resetRowSelection();
    } catch (error) {
      toast.error('Failed to delete some leads');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;

        let jsonData: Record<string, string>[] = [];
        let headers: string[] = [];

        if (file.name.endsWith('.csv')) {
          const workbook = read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = utils.sheet_to_json(worksheet);
          if (jsonData.length > 0) {
            headers = Object.keys(jsonData[0]);
          }
        } else if (file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          if (jsonData.length > 0) {
            headers = Object.keys(jsonData[0]);
          }
        }

        setFileData(jsonData);
        setHeaders(headers);
      } catch (error) {
        toast.error('Failed to parse file');
      }
    };

    reader.readAsBinaryString(file);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    try {
      // Filter out only the visible columns
      const visibleColumns = table.getAllColumns().filter((column) => column.getIsVisible());
      
      // Get the data for the visible columns
      const exportData = leads.map((row: Lead) => {
        const rowData: Record<string, any> = {};
        visibleColumns.forEach((column) => {
          if (column.id && column.id !== 'actions' && column.id !== 'mrt-row-select') {
            rowData[column.id] = row[column.id as keyof Lead];
          }
        });
        return rowData;
      });

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      // Download the file
      if (format === 'csv') {
        XLSX.writeFile(workbook, 'leads.csv');
      } else {
        XLSX.writeFile(workbook, 'leads.xlsx');
      }

      toast.success(`Leads exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export leads');
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: leads,
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
        height: '540px',
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
              variant='outline'
              size='sm'
              onClick={handleBulkDelete}
              className='text-red-600'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete Selected
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4 mr-2' />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import as CSV
                  <input
                    type='file'
                    ref={fileInputRef}
                    accept='.csv'
                    className='hidden'
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import as XLSX
                  <input
                    type='file'
                    accept='.xlsx'
                    className='hidden'
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <Download className='h-4 w-4 mr-2' />
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
          <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
            <CirclePlus className='h-4 w-4 mr-2' /> Add New Lead
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
      <Card className='min-h-full w-full p-6'>
        <div className='flex justify-between items-center mb-2'>
          <div>
            <h1 className='text-2xl font-bold'>Leads Management</h1>
            <p className='text-sm text-muted-foreground'>
              Manage and track your leads in one place
            </p>
          </div>
        </div>

        <MaterialReactTable table={table} />

        {fileData && fileData.length > 0 && (
          <FileImportModal
            jsonData={fileData}
            headers={headers || []}
            onClose={() => setFileData(null)}
          />
        )}

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
