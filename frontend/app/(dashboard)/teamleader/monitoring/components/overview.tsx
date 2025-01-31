'use client';

import { LineChart } from '@tremor/react';

interface OverviewProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export function Overview({ data }: OverviewProps) {
  return (
    <div className='h-[350px]'>
      <LineChart
        className='h-[350px] mt-4'
        data={data}
        index='month'
        categories={['revenue']}
        colors={['blue']}
        yAxisWidth={60}
        showAnimation
        showLegend={false}
        valueFormatter={(value: number) =>
          `$${value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
        }
      />
    </div>
  );
}
