'use client';

import { LineChart } from '../lib/graphComp/LineChart';

const chartdata = [
  {
    date: 'Jan 23',
    Basic: 2890,
    Premium: 2338,
    Enterprise: 2556,
  },
  {
    date: 'Feb 23',
    Basic: 2756,
    Premium: 2103,
    Enterprise: 3556,
  },
  {
    date: 'Mar 23',
    Basic: 3322,
    Premium: 2194,
    Enterprise: 1556,
  },
  {
    date: 'Apr 23',
    Basic: 3470,
     emium: 2108,
    Enterprise: 3056,
  },
  {
    date: 'May 23',
    Basic: 3475,
    Premium: 1812,
    Enterprise: 1056,
  },
  {
    date: 'Jun 23',
    Basic: 3129,
    Premium: 1726,
    Enterprise: 2056,
  },
  {
    date: 'Jul 23',
    Basic: 3490,
    Premium: 1982,
    Enterprise: 2016,
  },
  {
    date: 'Aug 23',
    Basic: 2903,
    Premium: 2012,
    Enterprise: 4046,
  },
  {
    date: 'Sep 23',
    Basic: 2643,
    Premium: 2342,
    Enterprise: 2916,
  },
  {
    date: 'Oct 23',
    Basic: 2837,
    Premium: 2473,
    Enterprise: 4056,
  },
  {
    date: 'Nov 23',
    Basic: 2954,
    Premium: 3848,
    Enterprise: 2006,
  },
  {
    date: 'Dec 23',
    Basic: 3239,
    Premium: 3736,
    Enterprise: 1256,
  },
  {
    date: 'Dec 23',
    Basic: 2239,
    Premium: 4736,
    Enterprise: 4056,
  },
];

export const LineChartHero = () => (
  <LineChart
    className='h-full w-full text-[11px]'
    data={chartdata}
    index='date'
    categories={['Basic', 'Premium', 'Enterprise']}
    valueFormatter={(number: number) => `$${Intl.NumberFormat('us').format(number).toString()}`}
    onValueChange={(v) => console.log(v)}
  />
);
