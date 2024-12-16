'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import EmailAccountsSection from './components/EmailAccountsSection';
import EmailAnalyticsSection from './components/EmailAnalyticsSection';
import EmailCampaignSection from './components/EmailCampaignSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';

function EmailPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <section className='flex-1 space-y-4 p-4 md:p-6'>
      <Card className='container mx-auto p-6'>
        <h1 className='text-2xl font-bold mb-6'>Email Management</h1>

        <Tabs defaultValue='accounts' className='w-full' onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='accounts'>Email Accounts</TabsTrigger>
            <TabsTrigger value='templates'>Templates</TabsTrigger>
            <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='accounts'>
            <Card>
              <CardHeader>
                <CardTitle>Connected Email Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailAccountsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='templates'>
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTemplatesSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='campaigns'>
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailCampaignSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='analytics'>
            <Card>
              <CardHeader>
                <CardTitle>Email Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailAnalyticsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  );
}

export default EmailPage;
