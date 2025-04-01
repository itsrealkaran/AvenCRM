'use client';

import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

import WhatsAppPlaceholder from '@/components/placeholders/whatsapp';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudienceList, type AudienceGroup } from '@/components/whatsapp/audience-list';
import { CampaignsList } from '@/components/whatsapp/campaigns-list';
import { ConnectedAccounts } from '@/components/whatsapp/connected-accounts';
import { CreateCampaignModal, type Campaign } from '@/components/whatsapp/create-campaign-modal';
import { MetricsCards } from '@/components/whatsapp/metrics-cards';
import { WhatsAppConnectModal } from '@/components/whatsapp/whatsapp-connect-modal';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function WhatsAppCampaignsPage() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<AudienceGroup[]>([]);
  const [whatsAppCode, setWhatsAppCode] = useState<string | null>(null);

  const handleCreateCampaign = (newCampaign: Campaign) => {
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleCreateAudience = (newAudience: AudienceGroup) => {
    setAudiences([...audiences, newAudience]);
  };

  const { company } = useAuth();

  const handleWhatsAppLogin = () => {
    //@ts-ignore
    FB.login(
      (response: any) => {
        if (response.authResponse) {
          console.log('Logged in as:', response.authResponse);
          //@ts-ignore
          FB.api('/me', { fields: 'name, email' }, (userInfo) => {
            console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
            setIsConnected(true);
            setShowWhatsAppModal(false);
            setWhatsAppCode(response.authResponse.code);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      {
        config_id: '1931062140756222',
        response_type: 'code',
        override_default_response_type: true,
        scope: 'public_profile,email,ads_management',
      }
    );
  };

  useEffect(() => {
    if (whatsAppCode) {
      const fetchAccessToken = async () => {
        const response = await api.get(`/whatsapp/access-token/${whatsAppCode}`);
        const accessToken = response.data.access_token;
        console.log('Access token:', accessToken);

        if (!accessToken) {
          console.log('No access token found');
          return;
        }

        // @ts-ignore
        FB.api(`/me?access_token=${accessToken}`, (userInfo) => {
          console.log('User info:', userInfo);
          console.log('Logged in as:', userInfo.name, 'Email:', userInfo.email);
          setIsConnected(true);
          setShowWhatsAppModal(false);

          // @ts-ignore
          FB.api(
            `/debug_token?input_token=${accessToken}&access_token=${accessToken}`,
            (debugInfo: any) => {
              console.log('Debug info:', debugInfo);
              const wabaId = debugInfo.data.granular_scopes.find(
                (scope: any) => scope.scope === 'whatsapp_business_management'
              )?.target_id;
              console.log('WABA ID:', wabaId);
              console.log('debug info:', debugInfo);

              // @ts-ignore
              FB.api(
                `/${wabaId}/phone_numbers?access_token=${accessToken}`,
                (phoneNumbers: any) => {
                  console.log('Phone numbers:', phoneNumbers);

                  const phoneNumberData = phoneNumbers.data.map((phoneNumber: any) => ({
                    phoneNumberId: phoneNumber.id,
                    name: phoneNumber.verified_name,
                    phoneNumber: phoneNumber.display_phone_number,
                    codeVerificationStatus: phoneNumber.code_verification_status,
                  }));

                  api
                    .post('/whatsapp/accounts', {
                      displayName: userInfo.name,
                      phoneNumberData: phoneNumberData,
                      wabaid: wabaId,
                      accessToken: accessToken,
                    })
                    .then((response: any) => {
                      console.log('API response:', response);
                      setIsConnected(true);
                      setShowWhatsAppModal(false);
                    });

                  setIsConnected(true);
                  setShowWhatsAppModal(false);
                }
              );
            }
          );
        });
      };
      fetchAccessToken();
    }
  }, [whatsAppCode]);

  if (company?.planName !== 'ENTERPRISE') {
    return <WhatsAppPlaceholder />;
  }

  return (
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>WhatsApp Campaigns</h1>
          <p className='text-muted-foreground text-sm'>Manage your WhatsApp business campaigns</p>
        </div>
        {!isConnected ? (
          <Button
            onClick={handleWhatsAppLogin}
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
                onCreateCampaign={() => setShowCampaignModal(true)}
                audiences={[]}
                onUpdateCampaign={() => {}}
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
            onClick={handleWhatsAppLogin}
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
      />
    </Card>
  );
}
