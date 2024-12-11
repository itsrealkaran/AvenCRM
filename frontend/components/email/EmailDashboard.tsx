import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ComposeEmail } from './ComposeEmail';
import { EmailList } from './EmailList';
import { EmailTemplates } from './EmailTemplates';

export function EmailDashboard() {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Email Dashboard</CardTitle>
            <CardDescription>Manage your email campaigns and templates</CardDescription>
          </div>
          <Button>Compose New Email</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='inbox' className='max-w-[400px]'>
          <TabsList className='w-full flex items-center justify-center gap-5'>
            <TabsTrigger value='inbox'>Inbox</TabsTrigger>
            <TabsTrigger value='sent'>Sent</TabsTrigger>
            <TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
            <TabsTrigger value='templates'>Templates</TabsTrigger>
          </TabsList>

          <TabsContent value='inbox'>
            <EmailList type='inbox' />
          </TabsContent>

          <TabsContent value='sent'>
            <EmailList type='sent' />
          </TabsContent>

          <TabsContent value='scheduled'>
            <EmailList type='scheduled' />
          </TabsContent>

          <TabsContent value='templates'>
            <EmailTemplates />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
