'use client';

import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Calendar } from './components/calendar';
import { ClientManagement } from './components/client-manangment';
import { PerformanceMetrics } from './components/performance-metrics';
import { PropertyListings } from './components/property-listing';
import { TaskManager } from './components/task-manager';

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className='container mx-auto p-6 h-full overflow-y-scroll'>
      <Card className='bg-white p-4 h-full'>
        <h1 className='text-3xl font-bold mb-6'>Monitoring Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='tasks'>Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <div className='grid gap-6'>
              <PerformanceMetrics />
              <div className='grid grid-cols-2 gap-6'>
                <div className='col-span-1'>
                  <TaskManager />
                </div>
                <div className='col-span-1'>
                  <Calendar />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='properties'>
            <PropertyListings />
          </TabsContent>

          <TabsContent value='tasks'>
            <TaskManager />
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
}
