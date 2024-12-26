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

// Sample data (replace with real data from API)
const salesData = [
  { month: 'Jan', revenue: 5000, companies: 3 },
  { month: 'Feb', revenue: 7000, companies: 4 },
  { month: 'Mar', revenue: 10000, companies: 6 },
  { month: 'Apr', revenue: 8000, companies: 5 },
  { month: 'May', revenue: 12000, companies: 8 },
  { month: 'Jun', revenue: 15000, companies: 10 },
];

interface SuperAdminDashboardProps {
  user: User;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  return (
    <div className='space-y-4 p-3'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$57,234</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Companies</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-xs text-muted-foreground'>+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,429</div>
            <p className='text-xs text-muted-foreground'>+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+32.5%</div>
            <p className='text-xs text-muted-foreground'>+4.1% from last month</p>
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
              <BarChart data={salesData}>
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
              <LineChart data={salesData}>
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
