'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, Home, TrendingUp, Users } from 'lucide-react';
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PerformanceMetrics } from './components/performance-metrics';
import { TaskManager } from './components/task-manager';

// Sample data (replace with real data in production)
const salesData = [
  { month: 'Jan', sales: 5, listings: 3 },
  { month: 'Feb', sales: 7, listings: 4 },
  { month: 'Mar', sales: 10, listings: 6 },
  { month: 'Apr', sales: 8, listings: 5 },
  { month: 'May', sales: 12, listings: 8 },
  { month: 'Jun', sales: 15, listings: 10 },
];

const commissionData = [
  { month: 'Jan', commission: 15000 },
  { month: 'Feb', commission: 21000 },
  { month: 'Mar', commission: 30000 },
  { month: 'Apr', commission: 24000 },
  { month: 'May', commission: 36000 },
  { month: 'Jun', commission: 45000 },
];

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className='flex-1 space-y-4 p-4 md:p-8 pt-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
        <div className='flex items-center space-x-2'>
          <Button>Download Report</Button>
        </div>
      </div>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='tasks'>Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Sales</CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>57</div>
                <p className='text-xs text-muted-foreground'>+20.1% from last year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Active Listings</CardTitle>
                <Home className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>24</div>
                <p className='text-xs text-muted-foreground'>+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>New Clients</CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>18</div>
                <p className='text-xs text-muted-foreground'>+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Commission</CardTitle>
                <TrendingUp className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$45,231.89</div>
                <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
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
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip />
                    <Bar dataKey='sales' fill='#adfa1d' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='listings' fill='#2563eb' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You have 3 unread notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-8'>
                  <div className='flex items-center'>
                    <span className='relative flex h-2 w-2 mr-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75'></span>
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-sky-500'></span>
                    </span>
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        New lead assigned: John Doe
                      </p>
                      <p className='text-sm text-muted-foreground'>2 minutes ago</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        Upcoming showing: 123 Main St
                      </p>
                      <p className='text-sm text-muted-foreground'>Tomorrow at 2:00 PM</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        Listing expires: 456 Elm St
                      </p>
                      <p className='text-sm text-muted-foreground'>In 5 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='analytics' className='space-y-4'>
          <PerformanceMetrics />
        </TabsContent>
        <TabsContent value='tasks'>
          <TaskManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
