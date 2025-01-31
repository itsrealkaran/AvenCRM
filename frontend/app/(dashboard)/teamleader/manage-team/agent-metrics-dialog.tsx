'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

interface Metrics {
  leadCount: number;
  dealCount: number;
  closedDealsValue: number;
}

export function AgentMetricsDialog({ open, onOpenChange, userId }: AgentMetricsDialogProps) {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ['userMetrics', userId, dateRange],
    queryFn: async () => {
      if (!userId) return null;
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${userId}/metrics?${params}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!userId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Agent Performance Metrics</DialogTitle>
          <DialogDescription>
            View the agent&apos;s performance metrics and filter by date range.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='startDate'>Start Date</Label>
              <Input
                id='startDate'
                type='date'
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor='endDate'>End Date</Label>
              <Input
                id='endDate'
                type='date'
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 mt-4'>
            <div className='p-4 rounded-lg bg-blue-50 border border-blue-100'>
              <h3 className='text-sm font-medium text-blue-900'>Total Leads</h3>
              {isLoading ? (
                <Skeleton className='h-8 w-20 mt-1' />
              ) : (
                <p className='text-2xl font-bold text-blue-700'>{metrics?.leadCount || 0}</p>
              )}
            </div>
            <div className='p-4 rounded-lg bg-green-50 border border-green-100'>
              <h3 className='text-sm font-medium text-green-900'>Total Deals</h3>
              {isLoading ? (
                <Skeleton className='h-8 w-20 mt-1' />
              ) : (
                <p className='text-2xl font-bold text-green-700'>{metrics?.dealCount || 0}</p>
              )}
            </div>
            <div className='p-4 rounded-lg bg-purple-50 border border-purple-100'>
              <h3 className='text-sm font-medium text-purple-900'>Closed Value</h3>
              {isLoading ? (
                <Skeleton className='h-8 w-20 mt-1' />
              ) : (
                <p className='text-2xl font-bold text-purple-700'>
                  ${metrics?.closedDealsValue.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
