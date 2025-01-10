'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Building2, CreditCard, TrendingUp, Users } from 'lucide-react';
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

interface SuperAdminDashboardProps {
  user: User;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [revenueData, setRevenueData] = useState<
    { month: string; revenue: number; companies: number }[]
  >([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/dashboard/superadmin');
        const data = await response.data;
        setRevenueData(data.salesData);
        setTotalRevenue(data.totalRevenue);
        setTotalCompanies(data.totalCompanies);
        setTotalUsers(data.totalUsers);
        setGrowthRate(data.growthRate);
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
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <div className='h-8 w-8 rounded-full bg-blue-100 p-2'>
              <CreditCard className='h-4 w-4 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>${totalRevenue.toLocaleString()}</div>
            <div className='flex items-center pt-1'>
              <span className={`text-xs ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate)}%
              </span>
              <span className='text-xs text-gray-500 ml-1'>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Companies</CardTitle>
            <div className='h-8 w-8 rounded-full bg-green-100 p-2'>
              <Building2 className='h-4 w-4 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{totalCompanies}</div>
            <div className='flex items-center pt-1'>
              <span className={`text-xs ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate)}%
              </span>
              <span className='text-xs text-gray-500 ml-1'>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <div className='h-8 w-8 rounded-full bg-purple-100 p-2'>
              <Users className='h-4 w-4 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>{totalUsers}</div>
            <div className='flex items-center pt-1'>
              <span className={`text-xs ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate)}%
              </span>
              <span className='text-xs text-gray-500 ml-1'>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-lg transition-shadow duration-300 border border-gray-100'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
            <div className='h-8 w-8 rounded-full bg-yellow-100 p-2'>
              <TrendingUp className='h-4 w-4 text-yellow-600' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900'>
              {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
            </div>
            <div className='flex items-center pt-1'>
              <span className={`text-xs ${growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate > 0 ? '↑' : '↓'} {Math.abs(growthRate)}%
              </span>
              <span className='text-xs text-gray-500 ml-1'>trend</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4 bg-white border border-gray-100'>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Companies with specific plans</CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            <ResponsiveContainer width='100%' height={350}>
              <BarChart data={revenueData}>
                <XAxis
                  dataKey='month'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#111827' }}
                />
                <Bar dataKey='revenue' fill='#3b82f6' radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className='col-span-3 bg-white border border-gray-100'>
          <CardHeader>
            <CardTitle>Company Growth</CardTitle>
            <CardDescription>Monthly registration analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={350}>
              <LineChart data={revenueData}>
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
                  dataKey='companies'
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
