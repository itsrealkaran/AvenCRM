'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Jan', total: 120 },
  { name: 'Feb', total: 150 },
  { name: 'Mar', total: 200 },
  { name: 'Apr', total: 180 },
  { name: 'May', total: 220 },
  { name: 'Jun', total: 250 },
];

export function EmailAnalytics() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Emails Sent</CardTitle>
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
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>1,234</div>
          <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Open Rate</CardTitle>
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
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>32.5%</div>
          <p className='text-xs text-muted-foreground'>+4.2% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Click-through Rate</CardTitle>
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
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>18.2%</div>
          <p className='text-xs text-muted-foreground'>+1.2% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Bounce Rate</CardTitle>
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
            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
          </svg>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>2.1%</div>
          <p className='text-xs text-muted-foreground'>-0.3% from last month</p>
        </CardContent>
      </Card>
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Email Engagement Overview</CardTitle>
          <CardDescription>Monthly email engagement metrics</CardDescription>
        </CardHeader>
        <CardContent className='pl-2'>
          <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey='name'
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
              <Bar dataKey='total' fill='#adfa1d' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
