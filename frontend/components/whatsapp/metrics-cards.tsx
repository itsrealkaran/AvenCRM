import { whatsAppService } from '@/api/whatsapp.service';
import { useQuery } from '@tanstack/react-query';
import { FaChartBar, FaClock, FaUsers, FaWhatsapp } from 'react-icons/fa';

import { Card, CardContent } from '@/components/ui/card';

export function MetricsCards({ campaigns }: { campaigns: any[] }) {
  const { data: metricsData } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => whatsAppService.getAccountStats(),
  });

  const thisMonthCampaigns = campaigns.filter((campaign) => {
    const campaignDate = new Date(campaign.createdAt);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return campaignDate >= thisMonth;
  });

  const lastMonthCampaigns = campaigns.filter((campaign) => {
    const campaignDate = new Date(campaign.createdAt);
    const lastMonth = new Date();
    lastMonth.setDate(1);
    return campaignDate >= lastMonth;
  });

  // figure out the growth/decline percentage
  const campaignGrowthPercentage =
    ((thisMonthCampaigns.length - lastMonthCampaigns.length) / lastMonthCampaigns.length) * 100;

  const metrics = [
    {
      title: 'Total Campaigns',
      value: thisMonthCampaigns.length,
      change:
        campaigns.length > 0
          ? campaignGrowthPercentage >= 0
            ? `+${campaignGrowthPercentage}%`
            : `${campaignGrowthPercentage}%`
          : '0%',
      icon: FaWhatsapp,
      iconColor: 'text-[#25D366]', // Updated icon color
    },
    {
      title: 'Active Conversations',
      value: metricsData?.activeConversations,
      change:
        metricsData?.activeConversationsChange !== undefined
          ? metricsData.activeConversationsChange >= 0
            ? `+${metricsData.activeConversationsChange}%`
            : `${metricsData.activeConversationsChange}%`
          : '0%',
      icon: FaUsers,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Message Open Rate',
      value: metricsData?.messageOpenRate,
      change:
        metricsData?.messageOpenRateChange !== undefined
          ? metricsData.messageOpenRateChange >= 0
            ? `+${metricsData.messageOpenRateChange}%`
            : `${metricsData.messageOpenRateChange}%`
          : '0%',
      icon: FaChartBar,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Avg. Response Time',
      value: '2m 30s',
      change: '-10%',
      icon: FaClock,
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>{metric.title}</p>
                <h3 className='text-2xl font-bold mt-2'>{metric.value}</h3>
                <p className='text-sm text-green-600 mt-1'>{metric.change} from last month</p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
