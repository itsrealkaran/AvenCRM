'use client';

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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';

interface SuperAdminDashboardProps {
  user: User;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; companies: number; }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard'); // Update with the actual API route
        const data = await response.json();
        setRevenueData(data.salesData);
        setTotalRevenue(data.totalRevenue);
        setTotalCompanies(data.totalCompanies);
        setTotalUsers(data.totalUsers);
        setGrowthRate(data.growthRate);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='space-y-4 p-3'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRevenue.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>{growthRate > 0 ? `+${growthRate}% from last month` : `${growthRate}% from last month`}</p>
          </CardContent>
        </Card>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Companies</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalCompanies}</div>
            <p className='text-xs text-muted-foreground'>{growthRate > 0 ? `+${growthRate}% from last month` : `${growthRate}% from last month`}</p>
          </CardContent>
        </Card>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsers}</div>
            <p className='text-xs text-muted-foreground'>{growthRate > 0 ? `+${growthRate}% from last month` : `${growthRate}% from last month`}</p>
          </CardContent>
        </Card>
        <Card className='bg-white hover:shadow-lg transition-shadow duration-300'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}</div>
            <p className='text-xs text-muted-foreground'>{growthRate > 0 ? `+4.1% from last month` : `4.1% from last month`}</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
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
                <Tooltip />
                <Bar dataKey='revenue' fill='#adfa1d' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Company Growth</CardTitle>
            <CardDescription>Monthly company registration trend</CardDescription>
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
                <Tooltip />
                <Line type='monotone' dataKey='companies' stroke='#2563eb' />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
