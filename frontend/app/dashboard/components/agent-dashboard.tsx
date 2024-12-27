'use client';

import { User } from '@/types';
import { Clock } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data (replace with real data from API)
const performanceData = [
  { month: 'Jan', leads: 5, deals: 3 },
  { month: 'Feb', leads: 7, deals: 4 },
  { month: 'Mar', leads: 10, deals: 6 },
  { month: 'Apr', leads: 8, deals: 5 },
  { month: 'May', leads: 12, deals: 8 },
  { month: 'Jun', leads: 15, deals: 10 },
];

interface AgentDashboardProps {
  user: User;
}

export function AgentDashboard({ user }: AgentDashboardProps) {
  return (
    <div className='space-y-4'>
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='tasks'>Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Active Leads</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>12</div>
                <p className='text-xs text-muted-foreground'>4 require follow-up</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Deals Closed</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>4</div>
                <p className='text-xs text-muted-foreground'>This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Commission</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>$12,234</div>
                <p className='text-xs text-muted-foreground'>+8.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Response Rate</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>95%</div>
                <p className='text-xs text-muted-foreground'>+4% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your monthly leads and deals</CardDescription>
              </CardHeader>
              <CardContent className='pl-2'>
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={performanceData}>
                    <XAxis
                      dataKey='month'
                      stroke='#888888'
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey='leads' fill='#adfa1d' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='deals' fill='#2563eb' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className='col-span-3'>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Your scheduled activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-8'>
                  <div className='flex items-center'>
                    <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>Property Viewing</p>
                      <p className='text-sm text-muted-foreground'>Today at 2:00 PM</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>Client Meeting</p>
                      <p className='text-sm text-muted-foreground'>Tomorrow at 10:00 AM</p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <Clock className='mr-2 h-4 w-4 text-muted-foreground' />
                    <div className='ml-4 space-y-1'>
                      <p className='text-sm font-medium leading-none'>Follow-up Call</p>
                      <p className='text-sm text-muted-foreground'>Friday at 3:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value='tasks'>
          <Card>
            <CardHeader>
              <CardTitle>Task List</CardTitle>
              <CardDescription>Your upcoming tasks and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className='flex items-center justify-between border-b pb-4'>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium leading-none'>Task {i + 1}</p>
                      <p className='text-sm text-muted-foreground'>Due in {i + 1} days</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div
                        className={`h-2 w-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      />
                      <span className='text-sm text-muted-foreground'>
                        {i % 2 === 0 ? 'On Track' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
