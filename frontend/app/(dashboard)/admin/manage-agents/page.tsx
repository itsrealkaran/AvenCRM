'use client';

import { useMemo, useRef, useState } from 'react';
import { UserRole, type User } from '@/types';
import { Box, lighten, ListItemIcon, MenuItem, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import {
  BarChart3,
  CirclePlus,
  Download,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  UserCog,
} from 'lucide-react';
import {
  MaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { read } from 'xlsx';
import { utils } from 'xlsx';

import FileImportModal from '@/components/data-table/file-import-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

import { AgentMetricsDialog } from './agent-metrics-dialog';
import { CreateAgentDialog } from './create-agent-dialog';

async function getAgents(): Promise<User[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch agents');
  }
  return response.json();
}

async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch current user');
  }
  return response.json();
}

export default function ManageAgentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  //const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<Record<string, string>[] | null>(null);

  const {
    data: agents = [],
    isLoading: isAgentsLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAgents,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
  });

  const deleteAgent = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${agentId}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Agent deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete agent');
    },
  });

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      TEAM_LEADER: 'bg-blue-100 text-blue-800',
      AGENT: 'bg-green-100 text-green-800',
      SUPERADMIN: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const bulkDeleteAgents = useMutation({
    mutationFn: async (agentIds: string[]) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user?ids=${agentIds.join(',')}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Agents deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete agents');
    },
  });

  const handleEdit = (agent: User) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync(agentId);
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const handleBulkDelete = async (agentIds: string[]) => {
    try {
      await bulkDeleteAgents.mutateAsync(agentIds);
    } catch (error) {
      toast.error('Failed to delete agents');
    }
  };

  const handleViewMetrics = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsMetricsDialogOpen(true);
  };

  const handleAddTeamMember = async (teamLeaderId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/team/add-member/${teamLeaderId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add team member');
      }

      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await refetch();
    setIsLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return;
    }

    try {
      let jsonData: Record<string, string>[] = [];
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'csv') {
        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].split(',').map((header) => header.trim());
        setHeaders(headers);
        console.log(headers, 'headers');

        jsonData = rows.slice(1).map((row) => {
          const values = row.split(',').map((value) => value.trim());
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index];
              return obj;
            },
            {} as Record<string, string>
          );
        });
      } else if (fileType === 'xlsx') {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get headers from the first row
        const headers = utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
        setHeaders(headers);

        jsonData = utils.sheet_to_json(worksheet);
      } else {
        throw new Error('Unsupported file format');
      }

      // Filter out empty objects (from empty lines)
      const filteredData = jsonData.filter((obj) => Object.keys(obj).length > 0);

      console.log('Converted data:', filteredData);
      toast.success(
        `Successfully parsed ${filteredData.length} rows from ${fileType?.toUpperCase()}`
      );

      // Reset the file input for future uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setFileData(filteredData);
    } catch (error) {
      console.error(`Error parsing ${file.name}:`, error);
      toast.error(`Failed to parse ${file.name}. Please check the format.`);
      setFileData(null);
    }
  };

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!agents || agents.length === 0) {
      toast.error('No data to download');
      return;
    }

    // Define common data structure
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Gender',
      'Role',
      'Commission Rate',
      'Commission Threshold',
      'Commission After Threshold',
    ];
    const data = agents.map((agent) => [
      agent.name || '',
      agent.email || '',
      agent.phone || '',
      agent.gender || '',
      agent.role || '',
      agent.commissionRate || '0',
      agent.commissionThreshhold || '0',
      agent.commissionAfterThreshhold || '0',
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
      link.setAttribute('download', `agents_${new Date().toISOString().split('T')[0]}.csv`);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Agents');

        // Generate filename
        const fileName = `agents_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download
        XLSX.writeFile(wb, fileName);

        toast.success('XLSX file downloaded successfully');
      } catch (error) {
        console.error('Error generating XLSX:', error);
        toast.error('Failed to generate XLSX file');
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableClickToCopy: true,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
      },
      {
        accessorKey: 'dob',
        header: 'Date of Birth',
        Cell: ({ row }) => {
          const date = new Date(row.getValue('dob'));
          return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/A';
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        Cell: ({ row }) => {
          const role: UserRole = row.getValue('role');
          return <Badge className={getRoleBadgeColor(role)}>{role.replace('_', ' ')}</Badge>;
        },
        filterVariant: 'select',
        filterSelectOptions: ['ADMIN', 'TEAM_LEADER', 'AGENT'],
      },
      {
        accessorKey: 'team',
        header: 'Team',
        Cell: ({ row }) => {
          const team = row.original.team;
          return team ? team.name : 'Not Assigned';
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        Cell: ({ row }) => {
          const isActive: boolean = row.getValue('isActive');
          return (
            <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        Cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/A';
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: agents,
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
            placeholder='Search agents...'
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
                const ok = confirm("Are you sure you want to delete these agents?");
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
                <Download className='h-4 w-4' />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <label className='flex w-full cursor-pointer'>
                  Import from CSV
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
                  Import from XLSX
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
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
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
          <Button size='sm' onClick={() => setIsCreateDialogOpen(true)}>
            <CirclePlus className='h-4 w-4' /> Add New Agent
          </Button>
        </Box>
      </Box>
    ),
    state: {
      isLoading: isLoading || isAgentsLoading,
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
        Edit Agent
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          handleViewMetrics(row.original.id);
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <UserCog />
        </ListItemIcon>
        View Metrics
      </MenuItem>,
      <MenuItem
        key={2}
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
        Delete Agent
      </MenuItem>,
    ],
  });

  return (
    <div className='min-h-full w-full'>
      <Card className='min-h-full flex flex-1 flex-col p-6'>
        <div className='flex justify-between items-center mb-2'>
          <div>
            <h1 className='text-2xl font-bold'>Team Manager</h1>
            <p className='text-sm text-muted-foreground'>
              Manage your team members and their roles
            </p>
          </div>
        </div>
        <MaterialReactTable table={table} />
      </Card>

      <CreateAgentDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (isEditDialogOpen) {
            setIsEditDialogOpen(open);
          } else {
            setIsCreateDialogOpen(open);
          }
        }}
        // @ts-ignore
        user={isCreateDialogOpen ? undefined : selectedAgent}
        refetch={refetch}
      />
      <AgentMetricsDialog
        open={isMetricsDialogOpen}
        onOpenChange={setIsMetricsDialogOpen}
        userId={selectedAgentId}
      />
      {fileData && (
        <FileImportModal
          jsonData={fileData}
          headers={headers || []}
          onClose={() => setFileData(null)}
        />
      )}
    </div>
  );
}
