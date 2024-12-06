'use client';

import React from 'react';
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DataTable } from '@/components/common-table';
import { columns } from '@/components/companies-table/columns';

const revenueData = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Feb', revenue: 25000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 30000 },
  { month: 'May', revenue: 40000 },
  { month: 'Jun', revenue: 35000 },
];

const customerData = [
  { name: 'Enterprise', value: 45 },
  { name: 'Pro', value: 30 },
  { name: 'Basic', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function AdminPage() {
  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
      </div>

      {/* Analytics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$163,000</div>
            <p className='text-xs text-muted-foreground'>+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Companies</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>245</div>
            <p className='text-xs text-muted-foreground'>+18 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,324</div>
            <p className='text-xs text-muted-foreground'>+42 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Plans</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>342</div>
            <p className='text-xs text-muted-foreground'>+8 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className='pl-2'>
            <ResponsiveContainer width='100%' height={350}>
              <BarChart data={revenueData}>
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='revenue' fill='#0088FE' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={350}>
              <PieChart>
                <Pie
                  data={customerData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={[]}
            filterableColumns={[
              {
                id: 'status',
                title: 'Status',
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
              },
              {
                id: 'plan',
                title: 'Plan',
                options: [
                  { label: 'Enterprise', value: 'enterprise' },
                  { label: 'Pro', value: 'pro' },
                  { label: 'Basic', value: 'basic' },
                ],
              },
            ]}
            searchableColumns={[
              {
                id: 'name',
                title: 'Name',
              },
              {
                id: 'email',
                title: 'Email',
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPage;
