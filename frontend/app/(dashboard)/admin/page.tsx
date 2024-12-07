"use client"
import React from 'react'
import GraphComp from './components/GraphComp'
import {useState} from "react"

import { TopNavigation } from './components/TopNavigation';
import { LineChartHero } from './components/LineChartHero';
import { BarChartHero } from './components/BarChartHero';
import { DonutChartHero } from './components/DonutChartHero';
import { BarChartProfitLossExample } from './components/BarChartProfitLossExample';
import { Users, Building2, CreditCard, TrendingUp, Mail, ShieldCheck } from 'lucide-react'
import { StatsCard } from './components/StatsCard'
import { RecentActivities } from './components/RecentActivities'


// ye macro hai  puri gand baad mai maregi 



const Page = () => {
  const [filterOpen, setfilterOpen] = useState(false)

  const filterClose = () =>{
    setfilterOpen(false)
  }

  // api to get the graphs data 
  // 4 graphs  4 different data arrays needed 
  
  return (
    
    <div className="w-full min-h-screen bg-[#f0f5fc] overflow-x-hidden">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TopNavigation />
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <StatsCard
            label="Total Users"
            value="1,234"
            icon={Users}
            trend={12}
            description="Active users this month"
          />
          <StatsCard
            label="Total Companies"
            value="156"
            icon={Building2}
            trend={8}
            description="Registered companies"
          />
          <StatsCard
            label="Revenue"
            value="$45,678"
            icon={CreditCard}
            trend={15}
            description="Monthly recurring revenue"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
          {/* Main Charts */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl p-4 h-[400px]">
              <GraphComp padding={2} Comp={LineChartHero} text="Sales Statistics" width="100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 h-[300px]">
                <GraphComp padding={2} Comp={BarChartHero} text="Renewal Status" width="100" />
              </div>
              <div className="bg-white rounded-xl p-4 h-[300px]">
                <GraphComp padding={2} Comp={DonutChartHero} text="Plan Distribution" width="100" />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-4 space-y-4">
            <RecentActivities />
            <div className="bg-white rounded-xl p-4 h-[300px]">
              <GraphComp padding={2} Comp={BarChartProfitLossExample} text="Visitor Trends" width="100" />
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <StatsCard
            label="Email Campaigns"
            value="45"
            icon={Mail}
            description="Active campaigns"
          />
          <StatsCard
            label="Growth Rate"
            value="23%"
            icon={TrendingUp}
            description="Month over month"
          />
          <StatsCard
            label="Security Score"
            value="98"
            icon={ShieldCheck}
            description="System security status"
          />
        </div>
      </div>
    </div>
  )
}

export default Page