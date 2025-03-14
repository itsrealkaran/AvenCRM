'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Briefcase, CheckSquare, DollarSign, Target } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';

interface AgentDashboardData {
  totalLeads: number;
  totalDeals: number;
  pendingTasks: number;
  revenue: {
    grossRevenue: number;
    myRevenue: number;
  };
  performanceData: {
    month: string;
    myRevenue: number;
    grossRevenue: number;
  }[];
  dealsClosureTrends: {
    month: string;
    deals: number;
  }[];
}

export function AgentDashboard() {
  const [dashboardData, setDashboardData] = useState<AgentDashboardData>({
    totalLeads: 0,
    totalDeals: 0,
    pendingTasks: 0,
    revenue: {
      grossRevenue: 0,
      myRevenue: 0,
    },
    performanceData: [],
    dealsClosureTrends: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRevenue, setSelectedRevenue] = useState<'commission' | 'total'>('commission');

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

  const processPerformanceData = (data: AgentDashboardData['performanceData']) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentMonth = new Date().getMonth();

    if (data.length === 6) {
      return data;
    } else {
      const dataLength = data.length;
      const missingMonths = 6 - dataLength;
      const futureMonths = Array.from({ length: missingMonths }, (_, i) => {
        const monthIndex = (currentMonth + i + 1) % 12; // +1 to start from next month
        return {
          month: months[monthIndex],
          grossRevenue: 0,
          myRevenue: 0,
          deals: 0,
        };
      });

      return [...data, ...futureMonths];
    }
  };

  if (loading) {
    return (
      <div className='space-y-4'>
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
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4 bg-gray-200 animate-pulse'>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='h-64 bg-gray-300 animate-pulse'></div>
            </CardContent>
          </Card>

          <Card className='col-span-3 bg-gray-200 animate-pulse'>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-64 bg-gray-300 animate-pulse'></div>
            </CardContent>
          </Card>
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

        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                {selectedRevenue === 'commission' ? 'Gross revenue' : 'Total Revenue'}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={selectedRevenue === 'total'}
                  onCheckedChange={(checked) =>
                    setSelectedRevenue(checked ? 'total' : 'commission')
                  }
                  className='scale-75'
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              $
              {selectedRevenue === 'commission'
                ? dashboardData?.revenue.myRevenue.toLocaleString()
                : dashboardData?.revenue.grossRevenue.toLocaleString()}
            </div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='h-4 w-4 text-green-500' />
              <p className='text-xs text-gray-500 mt-1'>
                {selectedRevenue === 'commission' ? 'Commission revenue' : 'Total revenue'}
              </p>
            </div>
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
              <BarChart data={processPerformanceData(dashboardData.performanceData)}>
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
                <Bar dataKey='myRevenue' fill='#3b82f6' radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey='grossRevenue' fill='#3b82f6' radius={[4, 4, 0, 0]} barSize={40} />
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
              <LineChart data={dashboardData.dealsClosureTrends}>
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
