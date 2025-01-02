'use client';

import React, { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { connectEmailAccount, disconnectEmailAccount } from './api';
import EmailAccountsSection from './components/EmailAccountsSection';
import EmailCampaignSection from './components/EmailCampaignSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';
import EmailRecipientsSection from './components/EmailRecipientsSection';

function EmailPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('accounts');

  const fetchEmailAccounts = async () => {
    try {
      const data = await fetchEmailAccounts();
      // setAccounts(data); // Note: setAccounts is not defined in the provided code
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email accounts',
        variant: 'destructive',
      });
    } finally {
      // setLoading(false); // Note: setLoading is not defined in the provided code
    }
  };

  const connectAccount = async (provider: 'GMAIL' | 'OUTLOOK') => {
    try {
      const url = await connectEmailAccount(provider);
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect email account',
        variant: 'destructive',
      });
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      await disconnectEmailAccount(accountId);
      await fetchEmailAccounts();
      toast({
        title: 'Success',
        description: 'Email account disconnected successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect email account',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className='flex-1 space-y-4 p-4 md:p-6'>
      <Card className='container mx-auto p-6'>
        <h1 className='text-2xl font-bold mb-6'>Email Management</h1>

        <Tabs defaultValue='accounts' className='w-full' onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='accounts'>Email Accounts</TabsTrigger>
            <TabsTrigger value='templates'>Templates</TabsTrigger>
            <TabsTrigger value='recipients'>Recipients</TabsTrigger>
            <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
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

          <TabsContent value='recipients'>
            <Card>
              <CardHeader>
                <CardTitle>Email Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailRecipientsSection />
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
        </Tabs>
      </Card>
    </section>
  );
}

export default EmailPage;
