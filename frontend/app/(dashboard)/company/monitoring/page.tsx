'use client';

import React from 'react';
import { BarChart3, Calendar, DollarSign, Filter, TrendingUp, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for the pipeline conversion
const pipelineData = [
  { name: 'Discovery', value: 120 },
  { name: 'Proposal', value: 86 },
  { name: 'Negotiation', value: 54 },
  { name: 'Won', value: 32 },
];

// Sample data for revenue trend
const revenueTrendData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

// Sample data for agent performance
const agentPerformanceData = [
  { name: 'John', deals: 12, revenue: 240000 },
  { name: 'Sarah', deals: 15, revenue: 310000 },
  { name: 'Mike', deals: 8, revenue: 180000 },
  { name: 'Emily', deals: 10, revenue: 220000 },
];

export default function MonitoringPage() {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header Section */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Company Monitoring</h1>
          <p className='text-gray-500 mt-1'>Track your company's performance and metrics</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center bg-white rounded-lg border shadow-sm'>
            <select className='px-4 py-2 rounded-lg outline-none'>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <Calendar className='w-4 h-4 mr-2 text-gray-500' />
          </div>
          <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <Filter className='w-4 h-4 text-gray-500' />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-500'>Total Agents</CardTitle>
            <Users className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>45</div>
            <p className='text-xs text-green-500 flex items-center'>
              <TrendingUp className='w-3 h-3 mr-1' />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-500'>Total Revenue</CardTitle>
            <DollarSign className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$2.4M</div>
            <p className='text-xs text-green-500 flex items-center'>
              <TrendingUp className='w-3 h-3 mr-1' />
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-500'>Avg. Deal Size</CardTitle>
            <BarChart3 className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$125K</div>
            <p className='text-xs text-green-500 flex items-center'>
              <TrendingUp className='w-3 h-3 mr-1' />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-gray-500'>Conversion Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>26.7%</div>
            <p className='text-xs text-red-500 flex items-center'>
              <TrendingUp className='w-3 h-3 mr-1 rotate-180' />
              -2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Pipeline Conversion */}
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='w-5 h-5' />
              Pipeline Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='value' fill='#3b82f6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5' />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='revenue' stroke='#3b82f6' />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Section */}
      <Card className='hover:shadow-lg transition-shadow'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Top Performing Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis yAxisId='left' orientation='left' stroke='#3b82f6' />
                <YAxis yAxisId='right' orientation='right' stroke='#10b981' />
                <Tooltip />
                <Legend />
                <Bar yAxisId='left' dataKey='deals' fill='#3b82f6' name='Deals Closed' />
                <Bar yAxisId='right' dataKey='revenue' fill='#10b981' name='Revenue Generated' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}