'use client';

import { useState } from 'react';
import { User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { AgentMetricsDialog } from './agent-metrics-dialog';
import { columns } from './columns';
import { CreateAgentDialog } from './create-agent-dialog';
import { DataTable } from './data-table';
import { EditAgentDialog } from './edit-agent-dialog';

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
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading: isAgentsLoading } = useQuery({
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

  return (
    <section className='h-full'>
      <Card className='container space-y-4 p-4 md:p-6 h-full'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Agent Management</h1>
            <p className='text-muted-foreground'>Manage your team members and their roles</p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' /> Add New Agent
            </Button>
          </div>
        </div>

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
          isLoading={isAgentsLoading}
        />

        <CreateAgentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        <EditAgentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={selectedAgent}
        />
        <AgentMetricsDialog
          open={isMetricsDialogOpen}
          onOpenChange={setIsMetricsDialogOpen}
          userId={selectedAgentId}
        />
      </Card>
    </section>
  );
}
