'use client';

import React, { useState } from 'react';
import { Building2, CreditCard, Mail, ShieldCheck, TrendingUp, Users } from 'lucide-react';

import { BarChartHero } from './components/BarChartHero';
import { BarChartProfitLossExample } from './components/BarChartProfitLossExample';
import { DonutChartHero } from './components/DonutChartHero';
import GraphComp from './components/GraphComp';
import { LineChartHero } from './components/LineChartHero';
import { RecentActivities } from './components/RecentActivities';
import { StatsCard } from './components/StatsCard';

// ye macro hai  puri gand baad mai maregi

const Page = () => {
  const [filterOpen, setfilterOpen] = useState(false);

  const filterClose = () => {
    setfilterOpen(false);
  };

  // api to get the graphs data
  // 4 graphs  4 different data arrays needed

  return (
    <div className='w-full h-full overflow-y-auto'>
      <div className='w-full mx-auto px-4 sm:px-6 lg:px-8 mb-24'>
        {/* Stats Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
          <StatsCard
            label='Total Users'
            value='1,234'
            icon={Users}
            trend={12}
            description='Active users this month'
          />
          <StatsCard
            label='Total Companies'
            value='156'
            icon={Building2}
            trend={8}
            description='Registered companies'
          />
          <StatsCard
            label='Revenue'
            value='$45,678'
            icon={CreditCard}
            trend={15}
            description='Monthly recurring revenue'
          />
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8'>
          {/* Main Charts */}
          <div className='lg:col-span-8 space-y-4'>
            <div className='bg-white rounded-xl p-4 h-[400px]'>
              <GraphComp padding={2} Comp={LineChartHero} text='Sales Statistics' width='100' />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-white rounded-xl p-4 h-[300px]'>
                <GraphComp padding={2} Comp={BarChartHero} text='Renewal Status' width='100' />
              </div>
              <div className='bg-white rounded-xl p-4 h-[300px]'>
                <GraphComp padding={2} Comp={DonutChartHero} text='Plan Distribution' width='100' />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className='lg:col-span-4 space-y-4'>
            <div className='gap-4 space-y-5'>
              <StatsCard
                label='Email Campaigns'
                value='45'
                icon={Mail}
                description='Active campaigns'
              />
              <StatsCard
                label='Growth Rate'
                value='23%'
                icon={TrendingUp}
                description='Month over month'
              />
              <StatsCard
                label='Security Score'
                value='98'
                icon={ShieldCheck}
                description='System security status'
              />
            </div>
            <div className='bg-white rounded-xl p-4 h-[300px]'>
              <GraphComp
                padding={2}
                Comp={BarChartProfitLossExample}
                text='Visitor Trends'
                width='100'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
