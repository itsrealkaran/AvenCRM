'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmailAccount } from '@/types/email';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { connectEmailAccount, disconnectEmailAccount, fetchEmailAccounts } from './api';
import EmailAccountsSection from './components/EmailAccountsSection';
import EmailCampaignSection from './components/EmailCampaignSection';
import EmailRecipientsSection from './components/EmailRecipientsSection';
import EmailTemplatesSection from './components/EmailTemplatesSection';

const VALID_TABS = ['accounts', 'templates', 'recipients', 'campaigns'];

function EmailPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const tab = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tab ?? '') ? tab : 'accounts';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    loadEmailAccounts();
  }, []);

  const loadEmailAccounts = async () => {
    try {
      setLoading(true);
      const data = await fetchEmailAccounts();
      setAccounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (provider: 'GMAIL' | 'OUTLOOK') => {
    try {
      const url = await connectEmailAccount(provider);
      localStorage.setItem('emailRedirectUrl', window.location.href);
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect email account',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await disconnectEmailAccount(accountId);
      await loadEmailAccounts();
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
    <section className='h-full'>
      <Card className='container mx-auto p-6 h-full'>
        <h1 className='text-2xl font-bold mb-6 text-primary'>Email Management</h1>

        <Card>
          <Tabs value={activeTab ?? 'accounts'} className='w-full' onValueChange={handleTabChange}>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='accounts'>Email Accounts</TabsTrigger>
              <TabsTrigger value='templates'>Templates</TabsTrigger>
              <TabsTrigger value='recipients'>Recipients</TabsTrigger>
              <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value='accounts'>
              <CardHeader>
                <CardTitle>Connected Email Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailAccountsSection
                  accounts={accounts}
                  loading={loading}
                  onConnect={handleConnectAccount}
                  onDisconnect={handleDisconnectAccount}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value='templates'>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailTemplatesSection />
              </CardContent>
            </TabsContent>

            <TabsContent value='recipients'>
              <CardHeader>
                <CardTitle>Email Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailRecipientsSection />
              </CardContent>
            </TabsContent>

            <TabsContent value='campaigns'>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <EmailCampaignSection />
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </Card>
    </section>
  );
}

export default EmailPageContent;
