'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, MousePointerClick, User } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsOverview {
  totalEmails: number;
  totalOpens: number;
  totalClicks: number;
  averageOpenRate: number;
  averageClickRate: number;
}

interface CampaignAnalytics {
  date: string;
  emailsSent: number;
  opens: number;
  clicks: number;
}

export default function EmailAnalyticsSection() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignAnalytics[]>([]);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      // Fetch overview data
      const overviewResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/analytics/overview`
      );
      if (!overviewResponse.ok) throw new Error('Failed to fetch overview');
      const overviewData = await overviewResponse.json();
      setOverview(overviewData);

      // Fetch campaign analytics
      const campaignResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/analytics/campaigns`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (!campaignResponse.ok) throw new Error('Failed to fetch campaign data');
      const campaignData = await campaignResponse.json();
      setCampaignData(campaignData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Emails Sent</CardTitle>
            <Mail className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overview?.totalEmails.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Open Rate</CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{(overview?.averageOpenRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Average Click Rate</CardTitle>
            <MousePointerClick className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(overview?.averageClickRate || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Opens</CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{overview?.totalOpens.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={campaignData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='date'
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line
                  type='monotone'
                  dataKey='emailsSent'
                  name='Emails Sent'
                  stroke='#8884d8'
                  activeDot={{ r: 8 }}
                />
                <Line type='monotone' dataKey='opens' name='Opens' stroke='#82ca9d' />
                <Line type='monotone' dataKey='clicks' name='Clicks' stroke='#ffc658' />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
