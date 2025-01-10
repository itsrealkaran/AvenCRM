'use client';

import { BarChart } from '@tremor/react';

interface TeamPerformanceProps {
  data: Array<{
    name: string;
    deals: number;
    revenue: number;
  }>;
}

export function TeamPerformance({ data }: TeamPerformanceProps) {
  return (
    <div className='h-[350px]'>
      <BarChart
        className='h-[350px] mt-4'
        data={data}
        index='name'
        categories={['deals', 'revenue']}
        colors={['blue', 'green']}
        yAxisWidth={48}
        showAnimation
        valueFormatter={(value: number) =>
          value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        }
      />
    </div>
  );
}
