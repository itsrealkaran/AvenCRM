'use client';

import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudienceList, type AudienceGroup } from '@/components/whatsapp/audience-list';
import { CampaignsList } from '@/components/whatsapp/campaigns-list';
import { ConnectedAccounts } from '@/components/whatsapp/connected-accounts';
import { CreateCampaignModal, type Campaign } from '@/components/whatsapp/create-campaign-modal';
import { MetricsCards } from '@/components/whatsapp/metrics-cards';
import { WhatsAppConnectModal } from '@/components/whatsapp/whatsapp-connect-modal';

export default function WhatsAppCampaignsPage() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<AudienceGroup[]>([]);

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleCreateAudience = (newAudience: AudienceGroup) => {
    setAudiences([...audiences, newAudience]);
  };

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>WhatsApp Campaigns</h1>
          <p className='text-muted-foreground text-sm'>Manage your WhatsApp business campaigns</p>
        </div>
        {!isConnected ? (
          <Button
            onClick={() => setShowWhatsAppModal(true)}
            className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
          >
            <FaWhatsapp className='w-4 h-4 mr-2' />
            Connect WhatsApp
          </Button>
        ) : (
          <Button
            onClick={() => setShowCampaignModal(true)}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
          >
            Create Campaign
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
              <TabsTrigger value='audience'>Audience</TabsTrigger>
            </TabsList>
            <TabsContent value='campaigns'>
              <CampaignsList
                campaigns={campaigns}
                audiences={[]}
                onUpdateCampaign={() => {}}
                onCreateCampaign={() => setShowCampaignModal(true)}
              />
            </TabsContent>
            <TabsContent value='accounts'>
              <ConnectedAccounts />
            </TabsContent>
            <TabsContent value='audience'>
              <AudienceList audiences={audiences} onCreateAudience={handleCreateAudience} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
          <FaWhatsapp className='w-16 h-16 text-[#25D366] mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Connect Your WhatsApp Business Account</h2>
          <p className='text-muted-foreground mb-4'>
            Connect your WhatsApp Business account to start creating and managing campaigns
          </p>
          <Button
            onClick={() => setShowWhatsAppModal(true)}
            className='bg-[#25D366] hover:bg-[#25D366]/90 text-white'
          >
            Connect Now
          </Button>
        </div>
      )}

      <WhatsAppConnectModal
        open={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onConnect={() => setIsConnected(true)}
      />

      <CreateCampaignModal
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        onCreateCampaign={handleCreateCampaign}
        audiences={audiences} // @ts-ignore
        onCreateAudience={null}
        editingCampaign={null}
      />
    </Card>
  );
}
