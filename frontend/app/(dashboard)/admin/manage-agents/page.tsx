'use client';

import { useState } from 'react';
import { UserRole, type User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { AgentMetricsDialog } from './agent-metrics-dialog';
import { columns } from './columns';
import { CreateAgentDialog } from './create-agent-dialog';
import { DataTable } from './data-table';

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
  //const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient();

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

  return (
    <div className='h-full w-full'>
      <Card className='h-full flex flex-col'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-2xl font-bold'>Team Manager</CardTitle>
          <CardDescription>Manage your team members and their roles</CardDescription>
        </CardHeader>
        <div className='space-4 px-6 pb-4 h-[10%] flex-1'>
          <DataTable
            columns={columns}
            data={agents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBulkDelete={async (rows) => {
              const agentIds = rows.map((row) => row.original.id);
              await handleBulkDelete(agentIds);
            }}
            onViewMetrics={handleViewMetrics}
            onAddTeamMember={handleAddTeamMember}
            showTeamActions={currentUser?.role === 'TEAM_LEADER'}
            disabled={isLoading || isAgentsLoading}
            isLoading={isLoading || isAgentsLoading}
            onRefresh={handleRefresh}
            onDownload={handleDownload}
            onCreateAgent={() => setIsCreateDialogOpen(true)}
          />
        </div>
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
      />
      <AgentMetricsDialog
        open={isMetricsDialogOpen}
        onOpenChange={setIsMetricsDialogOpen}
        userId={selectedAgentId}
      />
    </div>
  );
}
