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

  const handleEdit = (agent: User) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
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

  if (isAgentsLoading) {
    return (
      <section className='flex-1 p-2 md:p-4'>
        <Card className='container mx-auto p-4 md:p-5'>
          <div className='flex justify-between items-center'>
            <div>
              <Skeleton className='h-10 w-60 mb-2' />
              <Skeleton className='h-6 w-96 bg-black/20' />
            </div>
            <div className='flex gap-2'>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' /> Add New Agent
              </Button>
            </div>
          </div>
          <div className='w-full items-center justify-center p-3'>
            <Skeleton className='w-[95%] h-[400px]' />
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className='flex-1 p-2 md:p-4 h-full'>
      <Card className='container mx-auto p-4 md:p-5'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-primary'>Agent Management</h1>
            <p className='text-muted-foreground'>Manage your team members and their roles</p>
          </div>
        </div>

        <div className='space-4 p-6'>
          <DataTable
            columns={columns}
            data={agents}
            onEdit={handleEdit}
            onDelete={() => {}}
            onBulkDelete={async (rows) => {
              const agentIds = rows.map((row) => row.original.id);
            }}
            onViewMetrics={handleViewMetrics}
            onAddTeamMember={handleAddTeamMember}
            showTeamActions={currentUser?.role === 'TEAM_LEADER'}
            disabled={isLoading || isAgentsLoading}
          />
        </div>
      </Card>
    </section>
  );
}
