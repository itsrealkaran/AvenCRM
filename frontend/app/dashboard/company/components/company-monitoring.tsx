'use client';

import { useState } from 'react';
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const revenueData = [
  { month: 'Jan', revenue: 150000 },
  { month: 'Feb', revenue: 180000 },
  { month: 'Mar', revenue: 220000 },
  { month: 'Apr', revenue: 240000 },
  { month: 'May', revenue: 280000 },
  { month: 'Jun', revenue: 310000 },
];

const propertiesSoldData = [
  { month: 'Jan', properties: 12 },
  { month: 'Feb', properties: 15 },
  { month: 'Mar', properties: 18 },
  { month: 'Apr', properties: 20 },
  { month: 'May', properties: 25 },
  { month: 'Jun', properties: 28 },
];

const topAgents = [
  { id: 1, name: 'Alice Johnson', sales: 28, revenue: 840000 },
  { id: 2, name: 'Bob Smith', sales: 24, revenue: 720000 },
  { id: 3, name: 'Charlie Brown', sales: 22, revenue: 660000 },
  { id: 4, name: 'Diana Martinez', sales: 20, revenue: 600000 },
  { id: 5, name: 'Edward Lee', sales: 18, revenue: 540000 },
];

export function CompanyMonitoring() {
  const [timeRange, setTimeRange] = useState('6M');

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-3xl font-bold'>Company Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select time range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1M'>Last Month</SelectItem>
            <SelectItem value='3M'>Last 3 Months</SelectItem>
            <SelectItem value='6M'>Last 6 Months</SelectItem>
            <SelectItem value='1Y'>Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Agents</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>42</div>
            <p className='text-xs text-muted-foreground'>+10% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$1,380,000</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Properties Sold</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 3v18h18' />
              <path d='m19 9-5 5-4-4-3 3' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>118</div>
            <p className='text-xs text-muted-foreground'>+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg. Sale Price</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$425,000</div>
            <p className='text-xs text-muted-foreground'>+5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={revenueData}>
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
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip />
                <Line type='monotone' dataKey='revenue' stroke='#8884d8' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Properties Sold</CardTitle>
            <CardDescription>Number of properties sold per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={propertiesSoldData}>
                <XAxis
                  dataKey='month'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey='properties' fill='#8884d8' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
          <CardDescription>Agents with the highest sales in the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Properties Sold</TableHead>
                <TableHead>Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${agent.name}`}
                        />
                        <AvatarFallback>
                          {agent.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>{agent.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{agent.sales}</TableCell>
                  <TableCell>${agent.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
