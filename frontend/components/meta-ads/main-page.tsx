'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Facebook, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { CampaignsList } from '@/components/meta-ads/campaigns-list';
import { ConnectedAccounts } from '@/components/meta-ads/connected-accounts';
import CreateCampaignModal from '@/components/meta-ads/create-campaign-modal';
import { CreateFormModal } from '@/components/meta-ads/create-form-modal';
import { FacebookConnectModal } from '@/components/meta-ads/facebook-connect-modal';
import { FormsList } from '@/components/meta-ads/forms-list';
import { MetricsCards } from '@/components/meta-ads/metrics-cards';
import MetaAdsPlaceholder from '@/components/placeholders/meta-ads';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const getMetaAdAccounts = async () => {
  const response = await api.get('/meta-ads/accounts');
  return response.data;
};

export default function MetaAdsPage() {
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [facebookCode, setFacebookCode] = useState<string | null>(null);
  const [adAccountId, setAdAccountId] = useState<string | null>(null);
  const [leadForms, setLeadForms] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const { company } = useAuth();

  const {
    data: metaAdAccounts,
    isLoading,
    refetch: refetchMetaAdAccounts,
  } = useQuery({
    queryKey: ['meta-ad-accounts'],
    queryFn: () => getMetaAdAccounts(),
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const getAdAccountId = async (accessToken: string) => {
    //@ts-ignore
    FB.api(`/me/adaccounts?access_token=${accessToken}`, (response) => {
      if (response && !response.error) {
        console.log('Ad Accounts:', response);
        if (response.data.length > 0) {
          const adAccountId = response.data[0].account_id; // First Ad Account ID
          console.log('Ad Account ID:', adAccountId);
          console.log(response.data, 'response.data from getAdAccountId');
          setAdAccountId(adAccountId);
        } else {
          console.log('No ad accounts found.');
        }
      } else {
        console.error('Error fetching Ad Accounts:', response.error);
      }
    });
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await api.get('/meta-ads/forms', {
          headers: {
            Authorization: `Bearer ${metaAdAccounts[0].accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) {
          throw new Error('Failed to fetch forms');
        }

        const data = response.data;
        setLeadForms(data);
      } catch (err) {
        console.error('Error fetching forms:', err);
      }
    };

    fetchForms();
  }, [metaAdAccounts]);

  useEffect(() => {
    if (metaAdAccounts?.length > 0) {
      setIsConnected(true);
    }
  }, [metaAdAccounts]);

  useEffect(() => {
    if (metaAdAccounts?.length > 0) {
      // @ts-ignore
      FB.api(
        `/act_${adAccountId}/campaigns?access_token=${metaAdAccounts[0].accessToken}`,
        {
          effective_status: '["ACTIVE","PAUSED"]',
          fields: 'name,objective,status,created_time',
        },
        function (response: any) {
          if (response && !response.error) {
            console.log(response, 'response from get campaigns');
            setCampaigns(response.data);
          }
        }
      );
      //@ts-ignore
      FB.api(
        `/act_${adAccountId}/insights?access_token=${metaAdAccounts[0].accessToken}`,
        function (response: any) {
          if (response && !response.error) {
            console.log(response, 'response from get insights');
            setInsights(response.data);
          }
        }
      );
    }
  }, [metaAdAccounts, adAccountId]);

  const handleCreateForm = () => {};

  const handleFacebookLogin = () => {
    //@ts-ignore
    FB.login(
      (response: any) => {
        if (response.authResponse) {
          //@ts-ignore
          FB.api('/me', { fields: 'name, email' }, (userInfo) => {
            console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
            console.log(response, 'response');
            setFacebookCode(response.authResponse.code);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
          toast.error('Facebook connection cancelled');
        }
      },
      {
        config_id: '608691068704818',
        response_type: 'code',
        override_default_response_type: true,
      }
    );
  };

  useEffect(() => {
    const fetchFacebookAccessToken = async () => {
      if (facebookCode) {
        try {
          const response = await api.get(`/meta-ads/access-token/${facebookCode}`);
          const accessToken = response.data.access_token;

          //@ts-ignore
          FB.api(
            `/me?access_token=${accessToken}`,
            { fields: 'name, email, accounts' },
            async (userInfo: any) => {
              try {
                await api.post('/meta-ads/account', {
                  name: userInfo.name,
                  email: userInfo.email,
                  accessToken: accessToken,
                  pageId: userInfo.accounts.data[0].id,
                });

                setIsConnected(true);
                setShowFacebookModal(false);

                // Wait for the backend to process
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Refetch meta ad accounts
                await refetchMetaAdAccounts();

                // Only call getAdAccountId after we have the updated data
                getAdAccountId(accessToken);
              } catch (error) {
                console.error('Error saving Facebook account:', error);
              }
            }
          );
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    };
    fetchFacebookAccessToken();
  }, [facebookCode]);

  useEffect(() => {
    if (metaAdAccounts?.length > 0) {
      getAdAccountId(metaAdAccounts[0].accessToken);
    }
  }, [metaAdAccounts]);

  console.log(adAccountId, 'adAccountId');

  if (company?.planName !== 'ENTERPRISE') {
    return <MetaAdsPlaceholder />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const accessToken = metaAdAccounts?.[0]?.accessToken;

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Meta Ads</h1>
          <p className='text-sm text-muted-foreground'>Manage your Facebook ad campaigns</p>
        </div>

        {isLoading ? (
          <Button disabled className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            Loading...
          </Button>
        ) : accessToken ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
                Create <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowCampaignModal(true)}>
                Create Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowFormModal(true)}>
                Create Form
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleFacebookLogin} className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
            <Facebook className='w-4 h-4 mr-2' />
            Connect Facebook
          </Button>
        )}
      </div>

      {accessToken ? (
        <>
          <MetricsCards
            insights={insights}
            totalCampaigns={campaigns.length}
            activeCampaigns={campaigns.filter((campaign) => campaign.status === 'ACTIVE').length}
            successfulCampaigns={
              campaigns.filter((campaign) => campaign.status === 'ACTIVE').length
            }
            totalSpend={2000}
          />
          <Tabs defaultValue='campaigns' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
              <TabsTrigger value='accounts'>Connected Accounts</TabsTrigger>
              <TabsTrigger value='forms'>Forms</TabsTrigger>
            </TabsList>
            <TabsContent value='campaigns'>
              <CampaignsList
                accessToken={metaAdAccounts[0].accessToken}
                adAccountId={adAccountId}
                onCreateCampaign={() => setShowCampaignModal(true)}
                campaigns={campaigns}
              />
            </TabsContent>
            <TabsContent value='accounts'>
              <ConnectedAccounts metaAdAccounts={metaAdAccounts} />
            </TabsContent>
            <TabsContent value='forms'>
              <FormsList
                data={leadForms}
                accessToken={metaAdAccounts[0].accessToken}
                onCreateForm={() => setShowFormModal(true)}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
          <Facebook className='w-16 h-16 text-muted-foreground mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Connect Your Facebook Account</h2>
          <p className='text-muted-foreground mb-4'>
            Connect your Facebook account to start creating and managing ad campaigns
          </p>
          <Button onClick={handleFacebookLogin} className='bg-[#5932EA] hover:bg-[#5932EA]/90'>
            Connect Now
          </Button>
        </div>
      )}

      <FacebookConnectModal
        open={showFacebookModal}
        onClose={() => setShowFacebookModal(false)}
        onConnect={() => setIsConnected(true)}
      />

      <CreateCampaignModal
        adAccountId={adAccountId}
        accessToken={metaAdAccounts?.[0]?.accessToken}
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        pageId={metaAdAccounts?.[0]?.pageId}
      />

      <CreateFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        onCreateForm={handleCreateForm}
        pageId={metaAdAccounts?.[0]?.pageId}
        accessToken={metaAdAccounts?.[0]?.accessToken}
      />
    </Card>
  );
}
