'use client';

import { useEffect, useState } from 'react';
import { Gender, UserRole } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpgradePlanDialog } from '@/components/upgrade-plan-dialog';
import { useAuth } from '@/hooks/useAuth';

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User; // Optional user for editing mode
  refetch: () => void;
  totalAgents: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  role: UserRole;
  commissionRate: number;
  commissionThreshhold: number;
  commissionAfterThreshhold: number;
  teamId: string;
}

interface Team {
  id: string;
  name: string;
}

const getTeams = async (): Promise<Team[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/team/get-teams`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch teams');
  return response.json();
};

export function CreateAgentDialog({
  open,
  onOpenChange,
  user,
  refetch,
  totalAgents,
}: CreateAgentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showThreshold, setShowThreshold] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    agentRole: UserRole.AGENT,
    commissionRate: 0,
    commissionThreshhold: 0,
    commissionAfterThreshhold: 0,
    teamId: '',
  });
  const { company } = useAuth();

  useEffect(() => {
    if (user) {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender?.toUpperCase() || '',
        dob: formatDate(user.dob),
        agentRole: user.role || UserRole.AGENT,
        commissionRate: user.commissionRate || 0,
        commissionThreshhold: user.commissionThreshhold || 0,
        commissionAfterThreshhold: user.commissionAfterThreshhold || 0,
        teamId: user.teamId || '',
      });
      setShowThreshold(!!user.commissionThreshhold);
    } else {
      // Reset form when opening in create mode
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        agentRole: UserRole.AGENT,
        commissionRate: 0,
        commissionThreshhold: 0,
        commissionAfterThreshhold: 0,
        teamId: '',
      });
      setShowThreshold(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user && open) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        dob: '',
        agentRole: UserRole.AGENT,
        commissionRate: 0,
        commissionThreshhold: 0,
        commissionAfterThreshhold: 0,
        teamId: '',
      });
      setShowThreshold(false);
    }
  }, [open, user]);

  const queryClient = useQueryClient();
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (user) {
        console.log(formData, 'updating user');
        await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${user.id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, formData, {
          withCredentials: true,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['users', 'teams'] });
      onOpenChange(false);
      toast.success(`Agent ${user ? 'updated' : 'created'} successfully`);

      // Reset form data only when creating new agent
      if (!user) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          gender: '',
          dob: '',
          commissionRate: 0,
          commissionThreshhold: 0,
          commissionAfterThreshhold: 0,
          agentRole: UserRole.AGENT,
          teamId: '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${user ? 'update' : 'create'} agent. Please try again.`);
    } finally {
      setLoading(false);
      refetch();
    }
  };

  if (!company)
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='text-gray-500'>
          <p>Something went wrong</p>
          <p>Please try again later or contact support</p>
        </div>
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!user && totalAgents >= company.userCount ? (
        <UpgradePlanDialog
          isOpen={open}
          onClose={() => onOpenChange(false)}
          userLimit={company.userCount}
        />
      ) : (
        <DialogContent className='sm:max-w-[625px]'>
          <DialogHeader>
            <DialogTitle>{user ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
            <DialogDescription>
              {user
                ? 'Update the agent details below.'
                : 'Enter the details to create a new agent. They will receive an email with login credentials.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-6 py-4'>
              <div className='grid grid-cols-2 gap-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='phone'>Phone</Label>
                  <Input
                    id='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='gender'>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHERS}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='dob'>Date of Birth</Label>
                  <Input
                    id='dob'
                    type='date'
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='role'>Role</Label>
                  <Select
                    value={formData.agentRole}
                    onValueChange={(value: UserRole) =>
                      setFormData({ ...formData, agentRole: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
                      <SelectItem value={UserRole.TEAM_LEADER}>Team Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.agentRole === UserRole.AGENT || formData.teamId) && (
                  <div className='grid gap-2'>
                    <Label htmlFor='team'>Team</Label>
                    <Select
                      value={formData.teamId}
                      onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select team' />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className='grid gap-2'>
                  <Label htmlFor='commissionRate'>Commission Rate (%)</Label>
                  <Input
                    id='commissionRate'
                    type='number'
                    min={0}
                    max={100}
                    step={0.1}
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder='Enter commission rate'
                  />
                </div>
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='hasThreshold'
                    checked={showThreshold}
                    onCheckedChange={(checked) => {
                      setShowThreshold(checked === true);
                      if (!checked) {
                        setFormData({
                          ...formData,
                          commissionThreshhold: 0,
                          commissionAfterThreshhold: 0,
                        });
                      }
                    }}
                  />
                  <Label htmlFor='hasThreshold' className='whitespace-nowrap'>
                    Enable Commission Threshold
                  </Label>
                </div>
                {showThreshold && (
                  <div className='grid gap-6 py-4'>
                    <div className='flex gap-6'>
                      <div className='grid gap-2 flex-1'>
                        <Label htmlFor='commissionThreshhold' className='whitespace-nowrap'>
                          Threshold Amount
                        </Label>
                        <Input
                          id='commissionThreshhold'
                          type='number'
                          min={0}
                          step={1000}
                          value={formData.commissionThreshhold}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commissionThreshhold: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder='Enter threshold'
                        />
                      </div>
                      <div className='grid gap-2 flex-1'>
                        <Label htmlFor='commissionAfterThreshhold' className='whitespace-nowrap'>
                          Commission After (%)
                        </Label>
                        <Input
                          id='commissionAfterThreshhold'
                          type='number'
                          min={0}
                          max={100}
                          step={0.1}
                          value={formData.commissionAfterThreshhold}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              commissionAfterThreshhold: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder='Enter rate'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className='flex justify-around items-center text-gray-500 w-full'>
              <div>{totalAgents + '/' + company?.userCount}</div>
              <Button type='submit' disabled={loading}>
                {loading ? 'Creating...' : user ? 'Update Agent' : 'Create Agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
