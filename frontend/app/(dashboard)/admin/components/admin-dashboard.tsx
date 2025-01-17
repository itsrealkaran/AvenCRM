'use client';

import { useEffect } from 'react';
import { useQuery, useQueryErrorResetBoundary } from '@tanstack/react-query';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  DollarSign,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { LineChart } from '@/components/charts/line-chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';

interface TopPerformer {
  name: string;
  email: string;
  deals: number;
  revenue: number;
}

interface LeadMetric {
  status: string;
  count: number;
}

interface AdminDashboardData {
  totalDeals: number;
  activeLeads: number;
  wonDeals: number;
  revenue: number;
  growthRates: {
    deals: number;
    activeLeads: number;
    wonDeals: number;
    revenue: number;
  };
  performanceData: {
    month: string;
    deals: number;
    status: string;
    revenue: number;
  }[];
  topPerformers: TopPerformer[];
  leadMetrics: LeadMetric[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AdminDashboard() {
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/admin');
      return response.data as AdminDashboardData;
    },
    retry: 2,
  });

  useEffect(() => {
    if (isError) {
      console.error('Error fetching dashboard data');
      toast.error('Failed to fetch dashboard data');
    }
  }, [isError]);

  if (isError) {
    return (
      <div className='flex items-center justify-center h-[600px]'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900'>Failed to load dashboard data</h3>
          <p className='text-sm text-gray-500 mt-2'>Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Card key={index} className='bg-gray-50 animate-pulse'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
                <div className='h-8 w-8 rounded-full bg-gray-200'></div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-300'>Loading...</div>
                <p className='text-xs text-gray-300 mt-1'>Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4 bg-gray-50 animate-pulse'>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
              <CardDescription className='text-xs text-gray-300'>Loading...</CardDescription>
            </CardHeader>
            <CardContent className='pl-2'>
              <div className='h-64 bg-gray-200'></div>
            </CardContent>
          </Card>
          <Card className='col-span-3 bg-gray-50 animate-pulse'>
            <CardHeader>
              <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
              <CardDescription className='text-xs text-gray-300'>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-64 bg-gray-200'></div>
            </CardContent>
          </Card>
        </div>
        <Card className='bg-gray-50 animate-pulse'>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
            <CardDescription className='text-xs text-gray-300'>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[...Array(3)].map((_, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 rounded-full bg-gray-200'></div>
                    <div>
                      <p className='text-sm font-medium text-gray-300'>Loading...</p>
                      <p className='text-sm text-gray-300'>Loading...</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-300'>Loading...</p>
                    <div className='w-32 h-2 bg-gray-200 rounded'></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className='space-y-6'>
      {/* Key Metrics Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Total Deals</CardTitle>
            <div className='h-8 w-8 rounded-full bg-blue-100 p-2'>
              <Target className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData?.totalDeals}</div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='h-4 w-4 text-green-500' />
              <span className='text-xs text-green-500 ml-1'>
                {dashboardData?.growthRates.deals! >= 0 ? '+' : ''}
                {dashboardData?.growthRates.deals.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Active Leads</CardTitle>
            <div className='h-8 w-8 rounded-full bg-emerald-100 p-2'>
              <Users className='h-4 w-4 text-emerald-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData?.activeLeads}</div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='h-4 w-4 text-green-500' />
              <span className='text-xs text-green-500 ml-1'>
                {dashboardData?.growthRates.activeLeads! >= 0 ? '+' : ''}
                {dashboardData?.growthRates.activeLeads.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Won Deals</CardTitle>
            <div className='h-8 w-8 rounded-full bg-purple-100 p-2'>
              <Trophy className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{dashboardData?.wonDeals}</div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='h-4 w-4 text-green-500' />
              <span className='text-xs text-green-500 ml-1'>
                {dashboardData?.growthRates.wonDeals! >= 0 ? '+' : ''}
                {dashboardData?.growthRates.wonDeals.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>Revenue</CardTitle>
            <div className='h-8 w-8 rounded-full bg-yellow-100 p-2'>
              <DollarSign className='h-4 w-4 text-yellow-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              ${dashboardData?.revenue.toLocaleString()}
            </div>
            <div className='flex items-center pt-1'>
              <ArrowUpRight className='h-4 w-4 text-green-500' />
              <span className='text-xs text-green-500 ml-1'>
                {dashboardData?.growthRates.revenue! >= 0 ? '+' : ''}
                {dashboardData?.growthRates.revenue.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-7'>
        {/* Performance Chart */}
        <Card className='col-span-4 bg-white shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5 text-gray-500' />
              Performance Overview
            </CardTitle>
            <CardDescription>Monthly deals and revenue analysis</CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <ResponsiveContainer width='100%' height={350}>
              <BarChart data={dashboardData?.performanceData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis
                  dataKey='month'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: '#111827' }}
                />
                <Bar dataKey='deals' fill='#3b82f6' radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey='revenue' fill='#10b981' radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Distribution */}
        <Card className='col-span-3 bg-white shadow-sm'>
          <CardHeader>
            <CardTitle>Lead Distribution</CardTitle>
            <CardDescription>Status breakdown of current leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={350}>
              <LineChart
                className='mt-4 h-72'
                data={dashboardData!.leadMetrics}
                index='date'
                categories={['leads', 'deals']}
                colors={['gray', 'blue']}
                yAxisWidth={30}
              />
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Section */}
      <Card className='bg-white shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-yellow-500' />
            Top Performing Agents
          </CardTitle>
          <CardDescription>Agents with highest deal closure rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {dashboardData?.topPerformers.map((performer, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${performer.email}`} />
                    <AvatarFallback>{performer.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>{performer.name}</p>
                    <p className='text-sm text-gray-500'>{performer.deals} deals closed</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>
                    ${performer.revenue.toLocaleString()}
                  </p>
                  <Progress
                    value={(performer.deals / dashboardData.totalDeals) * 100}
                    className='w-32'
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
