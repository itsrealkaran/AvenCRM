'use client';

import { useState } from 'react';
import { ChevronDown, Facebook } from 'lucide-react';

import { CampaignsList } from '@/components/meta-ads/campaigns-list';
import { ConnectedAccounts } from '@/components/meta-ads/connected-accounts';
import { CreateCampaignModal, type Campaign } from '@/components/meta-ads/create-campaign-modal';
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
import { useAuth } from '@/hooks/useAuth';

export default function MetaAdsPage() {
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const { company } = useAuth();
  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleCreateForm = (newForm: Form) => {
    setForms([...forms, newForm]);
  };

  if (company?.planName !== 'ENTERPRISE') {
    return <MetaAdsPlaceholder />;
  }

  const handleFacebookLogin = () => {
    //@ts-ignore
    FB.login(
      (response: any) => {
        if (response.authResponse) {
          //@ts-ignore
          FB.api('/me', { fields: 'name, email' }, (userInfo) => {
            console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
            setIsConnected(true);
            setShowFacebookModal(false);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      {
        config_id: '608691068704818',
        response_type: 'code',
        override_default_response_type: true,
        scope: 'public_profile,email,ads_management',
      },
    );
  };

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Meta Ads</h1>
          <p className='text-muted-foreground'>Manage your Facebook ad campaigns</p>
        </div>
        {!isConnected ? (
          <Button
            onClick={handleFacebookLogin}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            <Facebook className='w-4 h-4 mr-2' />
            Connect Facebook
          </Button>
        ) : (
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
                campaigns={campaigns}
                onCreateCampaign={() => setShowCampaignModal(true)}
              />
            </TabsContent>
            <TabsContent value='accounts'>
              <ConnectedAccounts />
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
          <Button
            onClick={handleFacebookLogin}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
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
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onOpenFormModal={() => setShowFormModal(true)}
        onCreateCampaign={handleCreateCampaign}
        forms={forms}
      />

      <CreateFormModal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        onCreateForm={handleCreateForm}
      />
    </Card>
  );
}
