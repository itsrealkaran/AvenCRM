'use client';

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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export function PerformanceMetrics() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Sales</CardTitle>
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
          <div className='text-2xl font-bold'>57</div>
          <p className='text-xs text-muted-foreground'>+20.1% from last year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Listings</CardTitle>
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
            <path d='M16 8v8m-8-8v8M12 2v20' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>36</div>
          <p className='text-xs text-muted-foreground'>+12.5% from last year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Average Days on Market</CardTitle>
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
          <div className='text-2xl font-bold'>45</div>
          <p className='text-xs text-muted-foreground'>-5 days from last year</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Commission</CardTitle>
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
          <div className='text-2xl font-bold'>$171,000</div>
          <p className='text-xs text-muted-foreground'>+15.3% from last year</p>
        </CardContent>
      </Card>
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Sales and Listings Overview</CardTitle>
          <CardDescription>Number of sales and new listings per month</CardDescription>
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
              <Legend />
              <Bar dataKey='sales' fill='#adfa1d' radius={[4, 4, 0, 0]} name='Sales' />
              <Bar dataKey='listings' fill='#2563eb' radius={[4, 4, 0, 0]} name='New Listings' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Commission Trend</CardTitle>
          <CardDescription>Monthly commission earnings</CardDescription>
        </CardHeader>
        <CardContent className='pl-2'>
          <ResponsiveContainer width='100%' height={350}>
            <LineChart data={commissionData}>
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
              <Line type='monotone' dataKey='commission' stroke='#8884d8' strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
