'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EmailAccounts } from './components/email-account';
import { EmailAnalytics } from './components/email-anlytics';
import { EmailCompose } from './components/email-compose';
import { EmailInbox } from './components/email-inbox';
import { EmailTemplates } from './components/email-templates';

export default function EmailDashboard() {
  const [activeTab, setActiveTab] = useState('compose');

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Email Dashboard</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4 '>
        <TabsList className='grid w-full grid-cols-5 lg:min-h-[60px]'>
          <TabsTrigger value='compose'>Compose</TabsTrigger>
          <TabsTrigger value='inbox'>Inbox</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='accounts'>Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value='compose'>
          <EmailCompose />
        </TabsContent>
        <TabsContent value='inbox'>
          <EmailInbox />
        </TabsContent>
        <TabsContent value='analytics'>
          <EmailAnalytics />
        </TabsContent>
        <TabsContent value='templates'>
          <EmailTemplates />
        </TabsContent>
        <TabsContent value='accounts'>
          <EmailAccounts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
