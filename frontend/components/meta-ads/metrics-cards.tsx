import { useCurrency } from '@/contexts/CurrencyContext';
import { DollarSign, Target, Trophy, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface MetricsCardsProps {
  totalCampaigns: number;
  activeCampaigns: number;
  successfulCampaigns: number;
  totalSpend: number;
}

export function MetricsCards({
  totalCampaigns,
  activeCampaigns,
  successfulCampaigns,
  totalSpend,
}: MetricsCardsProps) {
  const { formatPrice } = useCurrency();

  const metrics = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      change: '+12%',
      icon: Target,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      change: '+8%',
      icon: Users,
      iconColor: 'text-green-500',
    },
    {
      title: 'Successful Campaigns',
      value: successfulCampaigns,
      change: '+15%',
      icon: Trophy,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Total Spend',
      value: formatPrice(totalSpend),
      change: '+20%',
      icon: DollarSign,
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
