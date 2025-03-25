'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Facebook, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { CampaignsList } from '@/components/meta-ads/campaigns-list';
import { ConnectedAccounts } from '@/components/meta-ads/connected-accounts';
import CreateCampaignModal from '@/components/meta-ads/create-campaign-modal';
import { CreateFormModal, type Form } from '@/components/meta-ads/create-form-modal';
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
  const [forms, setForms] = useState<Form[]>([]);
  const [adAccountId, setAdAccountId] = useState<string[] | null>(null);
  const { company, user } = useAuth();

  const { data: metaAdAccounts, isLoading } = useQuery({
    queryKey: ['meta-ad-accounts'],
    queryFn: () => getMetaAdAccounts(),
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
    if (metaAdAccounts?.length > 0) {
      setIsConnected(true);
    }
  }, [metaAdAccounts]);

  const handleCreateCampaign = (newCampaign: any) => {
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleCreateForm = (newForm: Form) => {
    setForms([...forms, newForm]);
  };

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
        const response = await api.get(`/meta-ads/access-token/${facebookCode}`);
        const accessToken = response.data.access_token;
        //@ts-ignore
        FB.api(`/me?access_token=${accessToken}`, { fields: 'name, email' }, (userInfo) => {
          console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
          console.log(response, 'response');
          console.log(userInfo, 'userInfo');

          // Save the Facebook connection status
          api
            .post('/meta-ads/account', {
              name: userInfo.name,
              email: userInfo.email,
              accessToken: accessToken,
            })
            .then(() => {
              setIsConnected(true);
              setShowFacebookModal(false);
            })
            .catch((error) => {
              console.error('Error saving Facebook account:', error);
            });
        });
        getAdAccountId(accessToken);
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
        ) : isConnected && metaAdAccounts?.length > 0 ? (
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

      {isConnected ? (
        <>
          <MetricsCards />
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
              />
            </TabsContent>
            <TabsContent value='accounts'>
              <ConnectedAccounts metaAdAccounts={metaAdAccounts} />
            </TabsContent>
            <TabsContent value='forms'>
              <FormsList forms={forms} onCreateForm={() => setShowFormModal(true)} />
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
      />

      <CreateFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        onCreateForm={handleCreateForm}
      />
    </Card>
  );
}
