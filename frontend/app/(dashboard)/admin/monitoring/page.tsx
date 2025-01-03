'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Filter,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
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
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MonitoringData {
  totalAgents: number;
  agentGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  avgDealSize: number;
  conversionRate: number;
  pipelineData: Array<{ name: string; value: number }>;
  revenueTrend: Array<{ month: string; revenue: number }>;
  agentPerformance: Array<{ name: string; deals: number; revenue: number }>;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/dashboard/monitoring');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        toast.error('Failed to fetch monitoring data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const MetricCard = ({
    title,
    value,
    growth,
    icon: Icon,
    prefix = '',
  }: {
    title: string;
    value: number | string;
    growth: number;
    icon: React.ElementType;
    prefix?: string;
  }) => (
    <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600'>{title}</CardTitle>
        <div className='h-8 w-8 rounded-full bg-blue-100 p-2'>
          <Icon className='h-4 w-4 text-blue-600' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-900'>
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className='flex items-center pt-1'>
          {growth > 0 ? (
            <ArrowUpRight className='h-4 w-4 text-green-500' />
          ) : (
            <ArrowDownRight className='h-4 w-4 text-red-500' />
          )}
          <span
            className={cn('text-xs ml-1', growth > 0 ? 'text-green-500' : 'text-red-500')}
          >{`${Math.abs(growth)}% from last month`}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section className='p-3'>
        <Card className='container mx-auto p-6 space-y-6 h-full pb-8'>
          <div className='space-y-4'>
            <Skeleton className='h-8 w-64' />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className='h-[400px] w-full' />
              ))}
            </div>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className='p-3'>
      <Card className='container mx-auto p-6 space-y-6 h-full pb-8 bg-gray-50'>
        {/* Header Section */}
        <div className='flex justify-between items-center sticky top-0 bg-gray-50 z-10 pb-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Company Monitoring</h1>
            <p className='text-gray-500 mt-1'>Track your company's performance metrics</p>
          </div>
          <div className='flex items-center gap-4'>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <Filter className='w-4 h-4 text-gray-500' />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <MetricCard
            title='Total Agents'
            value={data?.totalAgents ?? 0}
            growth={data?.agentGrowth ?? 0}
            icon={Users}
          />
          <MetricCard
            title='Total Revenue'
            value={data?.totalRevenue ?? 0}
            growth={data?.revenueGrowth ?? 0}
            icon={DollarSign}
            prefix='$'
          />
          <MetricCard
            title='Avg. Deal Size'
            value={Math.round(data?.avgDealSize || 0)}
            growth={5}
            icon={BarChart3}
            prefix='$'
          />
          <MetricCard
            title='Conversion Rate'
            value={`${(data?.conversionRate ?? 0).toFixed(1)}%`}
            growth={data?.conversionRate ? (data.conversionRate > 25 ? 2 : -2) : 0}
            icon={TrendingUp}
          />
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Pipeline Conversion */}
          <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='w-5 h-5 text-blue-500' />
                Pipeline Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={data?.pipelineData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey='value' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-green-500' />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-[300px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={data?.revenueTrend}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#10b981'
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Section */}
        <Card className='bg-white shadow-sm hover:shadow-md transition-all duration-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='w-5 h-5 text-purple-500' />
              Top Performing Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data?.agentPerformance}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' />
                  <YAxis yAxisId='left' orientation='left' stroke='#3b82f6' />
                  <YAxis yAxisId='right' orientation='right' stroke='#10b981' />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId='left' dataKey='deals' fill='#3b82f6' name='Deals Closed' />
                  <Bar yAxisId='right' dataKey='revenue' fill='#10b981' name='Revenue Generated' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Card>
    </section>
  );
}


/*** 
 * 
 * 'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Filter,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// Import the enhanced chart components
import { Overview } from './components/overview';
import { SalesActivity } from './components/sales-activity';
import { TeamPerformance } from './components/team-performance';

interface MonitoringData {
  totalAgents: number;
  agentGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  avgDealSize: number;
  conversionRate: number;
  pipelineData: Array<{ name: string; value: number }>;
  revenueTrend: Array<{ month: string; revenue: number }>;
  agentPerformance: Array<{ name: string; deals: number; revenue: number }>;
  // New metrics
  activeDeals: number;
  totalLeads: number;
  leadConversionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  teamUtilization: number;
  topPerformers: Array<{
    name: string;
    deals: number;
    revenue: number;
    conversion: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/dashboard/monitoring');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        toast.error('Failed to fetch monitoring data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const MetricCard = ({
    title,
    value,
    growth,
    icon: Icon,
    prefix = '',
    description,
  }: {
    title: string;
    value: number | string;
    growth?: number;
    icon: React.ElementType;
    prefix?: string;
    description?: string;
  }) => (
    <Card className='bg-card hover:bg-accent/5 transition-all duration-200'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {growth !== undefined && (
          <div className='flex items-center pt-1'>
            {growth > 0 ? (
              <ArrowUpRight className='h-4 w-4 text-green-500' />
            ) : (
              <ArrowDownRight className='h-4 w-4 text-red-500' />
            )}
            <span
              className={cn(
                'text-xs font-medium ml-1',
                growth > 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {`${Math.abs(growth)}% from last month`}
            </span>
          </div>
        )}
        {description && (
          <CardDescription className='mt-2 text-xs text-muted-foreground'>
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section className='p-6'>
        <div className='container space-y-6'>
          <Skeleton className='h-8 w-64' />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-32 w-full' />
            ))}
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className='h-[400px] w-full' />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='p-6'>
      <div className='container space-y-6'>

        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Performance Monitoring</h1>
            <p className='text-muted-foreground mt-1'>
              Comprehensive overview of your business metrics and KPIs
            </p>
          </div>
          <Button variant='outline' size='sm'>
            <Filter className='w-4 h-4 mr-2' />
            Filter
          </Button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <MetricCard
            title='Total Revenue'
            value={data?.totalRevenue ?? 0}
            growth={data?.revenueGrowth}
            icon={DollarSign}
            prefix='$'
            description='Total revenue generated this month'
          />
          <MetricCard
            title='Active Deals'
            value={data?.activeDeals ?? 0}
            icon={Target}
            description='Number of deals in pipeline'
          />
          <MetricCard
            title='Conversion Rate'
            value={`${(data?.conversionRate ?? 0).toFixed(1)}%`}
            growth={data?.conversionRate ? (data.conversionRate > 25 ? 2 : -2) : 0}
            icon={TrendingUp}
            description='Lead to deal conversion rate'
          />
          <MetricCard
            title='Team Utilization'
            value={`${(data?.teamUtilization ?? 0).toFixed(1)}%`}
            icon={Users}
            description='Current team capacity utilization'
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card className='col-span-2'>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Overview data={data?.revenueTrend ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Activity</CardTitle>
              <CardDescription>Deal progression through pipeline stages</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesActivity data={data?.pipelineData ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Top performing team members</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamPerformance data={data?.agentPerformance ?? []} />
            </CardContent>
          </Card>
        </div>


        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {data?.recentActivities?.map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-center justify-between p-2 rounded-lg hover:bg-accent/5'
                  >
                    <div className='flex items-center gap-3'>
                      {activity.type === 'deal' ? (
                        <DollarSign className='h-4 w-4 text-green-500' />
                      ) : (
                        <Clock className='h-4 w-4 text-blue-500' />
                      )}
                      <div>
                        <p className='text-sm font-medium'>{activity.description}</p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'success' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Lead Conversion</span>
                  <span className='text-sm text-muted-foreground'>{data?.leadConversionRate}%</span>
                </div>
                <Progress value={data?.leadConversionRate ?? 0} />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Customer Satisfaction</span>
                  <span className='text-sm text-muted-foreground'>
                    {data?.customerSatisfaction}%
                  </span>
                </div>
                <Progress value={data?.customerSatisfaction ?? 0} />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Response Time</span>
                  <span className='text-sm text-muted-foreground'>
                    {data?.averageResponseTime} hours
                  </span>
                </div>
                <Progress value={100 - (data?.averageResponseTime ?? 0 / 24) * 100} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

*/