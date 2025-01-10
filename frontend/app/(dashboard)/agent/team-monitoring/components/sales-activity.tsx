'use client';

import { BarChart } from '@tremor/react';

interface SalesActivityProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function SalesActivity({ data }: SalesActivityProps) {
  return (
    <div className='h-[350px]'>
      <BarChart
        className='h-[350px] mt-4'
        data={data}
        index='name'
        categories={['value']}
        colors={['blue']}
        yAxisWidth={48}
        showAnimation
        showLegend={false}
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
