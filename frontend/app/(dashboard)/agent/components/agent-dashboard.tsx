'use client';

import { useEffect, useState } from 'react';
import { Briefcase, CheckSquare, DollarSign, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface AgentDashboardData {
  totalLeads: number;
  totalDeals: number;
  pendingTasks: number;
  revenue: number;
  performanceData: {
    month: string;
    deals: number;
  }[];
}

export function AgentDashboard() {
  const [dashboardData, setDashboardData] = useState<AgentDashboardData>({
    totalLeads: 0,
    totalDeals: 0,
    pendingTasks: 0,
    revenue: 0,
    performanceData: [],
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/dashboard/agent');
        const data = await response.data;
        setDashboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='space-y-4 p-3'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Card key={index} className='bg-gray-200 animate-pulse'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
                <div className='h-8 w-8 rounded-full bg-gray-300'></div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>Loading...</div>
                <p className='text-xs text-gray-500 mt-1'>Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-3'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>My Leads</CardTitle>
            <div className='h-8 w-8 rounded-full bg-blue-100 p-2'>
              <Target className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData.totalLeads}</div>
            <p className='text-xs text-gray-500 mt-1'>Active leads assigned</p>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>My Deals</CardTitle>
            <div className='h-8 w-8 rounded-full bg-green-100 p-2'>
              <Briefcase className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData.totalDeals}</div>
            <p className='text-xs text-gray-500 mt-1'>Deals in progress</p>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Tasks</CardTitle>
            <div className='h-8 w-8 rounded-full bg-purple-100 p-2'>
              <CheckSquare className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData.pendingTasks}</div>
            <p className='text-xs text-gray-500 mt-1'>Tasks to complete</p>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>My Revenue</CardTitle>
            <div className='h-8 w-8 rounded-full bg-yellow-100 p-2'>
              <DollarSign className='h-4 w-4 text-yellow-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              ${dashboardData.revenue.toLocaleString()}
            </div>
            <p className='text-xs text-gray-500 mt-1'>Total revenue generated</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 bg-white border border-gray-100'>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Number of deals closed per month</CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <ResponsiveContainer width='100%' height={350}>
              <BarChart data={dashboardData.performanceData}>
                <XAxis
                  dataKey='month'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#111827' }}
                />
                <Bar dataKey='deals' fill='#3b82f6' radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='col-span-3 bg-white border border-gray-100'>
          <CardHeader>
            <CardTitle>Deal Trend</CardTitle>
            <CardDescription>Monthly deal closure trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={350}>
              <LineChart data={dashboardData.performanceData}>
                <XAxis
                  dataKey='month'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#111827' }}
                />
                <Line
                  type='monotone'
                  dataKey='deals'
                  stroke='#10b981'
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
