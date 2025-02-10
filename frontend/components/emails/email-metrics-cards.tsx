import { useEffect, useState } from 'react';
import { BarChart2, Clock, Mail, Users } from 'lucide-react';

import { getEmailAnalyticsOverview } from '@/components/email/api';
import { Card, CardContent } from '@/components/ui/card';

export function EmailMetricsCards() {
  const [metrics, setMetrics] = useState({
    totalCampaigns: 0,
    totalTemplates: 0,
    totalEmails: 0,
    averageOpenRate: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getEmailAnalyticsOverview();
        setMetrics({
          ...data.overview,
          averageOpenRate: data.overview.averageOpenRate || 0,
        });
      } catch (error) {
        console.error('Failed to fetch email analytics:', error);
      }
    };
    fetchMetrics();
  }, []);

  const metricsData = [
    {
      title: 'Total Campaigns',
      value: metrics.totalCampaigns.toString(),
      change: '+10%',
      icon: Mail,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Templates',
      value: metrics.totalTemplates.toString(),
      change: '+5%',
      icon: BarChart2,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Emails Sent',
      value: metrics.totalEmails.toLocaleString(),
      change: '+15%',
      icon: Users,
      iconColor: 'text-green-500',
    },
    {
      title: 'Avg. Open Rate',
      value: `${(metrics.averageOpenRate * 100).toFixed(1)}%`,
      change: '+3%',
      icon: Clock,
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {metricsData.map((metric) => (
        <Card key={metric.title} className='overflow-hidden'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>{metric.title}</p>
                <h3 className='text-2xl font-bold mt-2'>{metric.value}</h3>
                <p className='text-sm text-green-600 mt-1'>{metric.change} from last month</p>
              </div>
              <div className={`rounded-full p-3 ${metric.iconColor} bg-opacity-10`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
