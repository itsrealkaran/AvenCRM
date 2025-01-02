'use client';

import React from 'react';

import { BarChart, type BarChartEventProps } from './graphComp/BarChart';

const chartdata = [
  {
    name: ' New',
    'Conversion to Won ': 2488,
  },
  {
    name: 'Discovery',
    'Conversion to Won ': 1445,
  },
  {
    name: 'Negotiation',
    'Conversion to Won ': 743,
  },
  {
    name: 'Proposal',
    'Conversion to Won ': 281,
  },
  {
    name: 'Won',
    'Conversion to Won ': 98,
  },
];

export const BarChartHeroSec = () => {
  const [value, setValue] = React.useState<BarChartEventProps>(null);
  return (
    <>
      <BarChart
        className='h-full'
        data={chartdata}
        index='name'
        categories={['Conversion to Won ']}
        yAxisWidth={45}
        onValueChange={(v) => setValue(v)}
      />
    </>
  );
};
